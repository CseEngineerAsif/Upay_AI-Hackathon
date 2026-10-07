# Upay Safe - trained fraud-risk model (run in Google Colab: pip install lightgbm scikit-learn pandas numpy)
import numpy as np, pandas as pd, json, lightgbm as lgb
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, roc_curve, precision_recall_curve

rng = np.random.default_rng(42)
N_USERS, DAYS = 3000, 60
T0 = 0
rows = []
n_mules = 150
mule_ids = [f"m{i}" for i in range(n_mules)]

# ---------- 1. Scenario-based simulator (labels come from scenarios, NOT from rules) ----------
for u in range(N_USERS):
    base = float(np.exp(rng.normal(np.log(1200), 0.6)))
    age = int(rng.integers(5, 1500))
    night_worker = rng.random() < 0.08            # hard negative: legit odd hours
    contacts = [f"c{u}_{k}" for k in range(int(rng.integers(4, 15)))]
    balance = base * float(rng.uniform(5, 30))
    n_tx = rng.poisson(DAYS * 2.5)
    days = rng.integers(0, DAYS, n_tx)
    for d in days:
        hr = rng.normal(20 if night_worker else 14, 4) % 24
        ts = d * 86400 + hr * 3600 + rng.uniform(0, 600)
        new = rng.random() < 0.12
        rec = f"n{rng.integers(0, 10**6)}" if new else contacts[rng.integers(len(contacts))]
        amt = base * float(np.exp(rng.normal(0, 0.5)))
        if rng.random() < 0.03: amt = base * rng.uniform(3, 8)          # hard negative: legit big (rent/Eid)
        rows.append((u, ts, amt, rec, 0, balance, age, base, int(rng.random() < 0.03), int(rng.random() < 0.02), 0))
    # fraud victims
    if rng.random() < 0.20:
        d = int(rng.integers(5, DAYS))
        scen = rng.choice(["scam", "takeover"])
        mule = mule_ids[rng.integers(n_mules)]
        k = int(rng.integers(1, 4)) if scen == "scam" else int(rng.integers(2, 5))
        start = d * 86400 + (rng.uniform(10, 21) if scen == "scam" else rng.uniform(1, 5)) * 3600
        for j in range(k):
            amt = base * (rng.uniform(2.5, 9) if scen == "scam" else rng.uniform(4, 12))
            amt = min(amt, balance * rng.uniform(0.5, 0.95))
            kw = int(rng.random() < (0.4 if scen == "scam" else 0.05))
            rep = int(rng.poisson(3)) if rng.random() < 0.6 else 0     # mules only sometimes reported
            rows.append((u, start + j * rng.uniform(60, 600), amt, mule, kw, balance, age, base, kw, rep, 1))

df = pd.DataFrame(rows, columns=["user","ts","amount","recipient","note_flag","balance","acct_age","base","kw","reports","fraud"])
df["reports"] = df["reports"].astype(int)
df = df.sort_values(["user","ts"]).reset_index(drop=True)

# ---------- 2. Past-only features (leakage-safe) ----------
def feats(g):
    ts, amt = g.ts.values, g.amount.values
    cs = np.concatenate([[0], np.cumsum(amt)])
    i = np.arange(len(g))
    j15 = np.searchsorted(ts, ts - 900, "left"); j1h = np.searchsorted(ts, ts - 3600, "left")
    g["cnt_15m"] = i - j15; g["cnt_1h"] = i - j1h
    g["sum_1h_ratio"] = (cs[i] - cs[j1h]) / g.base.values
    g["new_recipient"] = (~g.duplicated("recipient")).astype(int)   # first time this user pays them
    return g
df = df.groupby("user", group_keys=False).apply(feats)
df["amt_ratio"] = df.amount / df.base
df["hour"] = (df.ts % 86400) / 3600
df["odd_hour"] = ((df.hour >= 1) & (df.hour <= 5.5)).astype(int)
df["drain_ratio"] = (df.amount / df.balance).clip(0, 1.5)
FEATURES = ["amt_ratio","hour","odd_hour","new_recipient","cnt_15m","cnt_1h","sum_1h_ratio","drain_ratio","acct_age","reports","note_flag"]

# ---------- 3. Temporal split ----------
day = df.ts // 86400
tr, va, te = df[day < 40], df[(day >= 40) & (day < 50)], df[day >= 50]
print("fraud rate train/val/test:", tr.fraud.mean(), va.fraud.mean(), te.fraud.mean())

# ---------- 4. Models ----------
params = dict(objective="binary", learning_rate=0.05, num_leaves=8, min_data_in_leaf=20, feature_fraction=0.9,
              is_unbalance=False, verbose=-1, seed=1, metric="average_precision")
gbm = lgb.train(params, lgb.Dataset(tr[FEATURES], tr.fraud), 120,
                valid_sets=[lgb.Dataset(va[FEATURES], va.fraud)], callbacks=[lgb.early_stopping(15, verbose=False)])
lr = LogisticRegression(max_iter=2000, class_weight="balanced").fit(tr[FEATURES], tr.fraud)

# rule baseline (your old engine, approximated)
def rules(d):
    return (25*d.new_recipient + 15*d.odd_hour + 25*(d.cnt_15m >= 2) + 35*(d.amt_ratio > 4) + 25*d.note_flag + 40*(d.reports >= 3)).clip(0, 100)

# ---------- 5. Calibration (isotonic on validation) ----------
iso = IsotonicRegression(out_of_bounds="clip", y_min=0, y_max=1).fit(gbm.predict(va[FEATURES]), va.fraud)

def recall_at_fpr(y, s, target):
    fpr, tpr, _ = roc_curve(y, s); return float(np.interp(target, fpr, tpr))
res = {}
for name, s in [("rules", rules(te).values), ("logreg", lr.predict_proba(te[FEATURES])[:,1]), ("lightgbm", iso.predict(gbm.predict(te[FEATURES])))]:
    res[name] = dict(PR_AUC=round(average_precision_score(te.fraud, s),3),
                     recall_at_1pct_FPR=round(recall_at_fpr(te.fraud, s, 0.01),3),
                     recall_at_5pct_FPR=round(recall_at_fpr(te.fraud, s, 0.05),3))
print(pd.DataFrame(res).T)

# operating points on CALIBRATED probability (policy: MEDIUM >= 0.10, HIGH >= 0.50)
high_thr, med_thr = 0.50, 0.10
p_te = iso.predict(gbm.predict(te[FEATURES]))
for nm, th in [("MEDIUM", med_thr), ("HIGH", high_thr)]:
    pred = p_te >= th; y = te.fraud.values
    print(nm, "precision", round(float(y[pred].mean()),3) if pred.any() else None,
          "recall", round(float(pred[y==1].mean()),3), "FPR", round(float(pred[y==0].mean()),4))

# ---------- 6. Export for TypeScript ----------
dump = gbm.dump_model()
def slim(n):
    if "leaf_value" in n: return {"v": n["leaf_value"]}
    return {"f": n["split_feature"], "t": n["threshold"], "l": slim(n["left_child"]), "r": slim(n["right_child"])}
model = {"features": FEATURES, "trees": [slim(t["tree_structure"]) for t in dump["tree_info"]],
         "calib_x": [float(x) for x in iso.X_thresholds_], "calib_y": [float(y) for y in iso.y_thresholds_],
         "high_threshold": high_thr, "medium_threshold": med_thr,
         "feature_medians": {f: float(tr[f].median()) for f in FEATURES}, "metrics": res}
json.dump(model, open("risk_model.json", "w"))
print("exported", len(model["trees"]), "trees")
