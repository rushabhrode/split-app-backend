// src/utils/settlementCalculator.js

/**
 * Calculate net balances for each person:
 *  positive → they’re owed money
 *  negative → they owe money
 */
function calculateBalances(expenses) {
  const balances = {};

  for (const exp of expenses) {
    const total = exp.amount;
    const shares = exp.shares.length
      ? exp.shares
      : [{ person: exp.paid_by, type: 'equal', value: null }]; // fallback

    // 1) add total to payer
    balances[exp.paid_by] = (balances[exp.paid_by] || 0) + total;

    // 2) subtract each share
    const n = shares.length;
    for (const sh of shares) {
      let owed;
      if (sh.type === 'equal') {
        owed = total / n;
      } else if (sh.type === 'percentage') {
        owed = (total * sh.value) / 100;
      } else { // exact
        owed = sh.value;
      }
      balances[sh.person] = (balances[sh.person] || 0) - owed;
    }
  }

  // round to 2 decimals
  for (const p in balances) {
    balances[p] = Math.round(balances[p] * 100) / 100;
  }

  return balances;
}

/**
 * Given balances {person: balance}, produce a minimal list
 * of transactions [ { from, to, amount } ]
 */
function calculateSettlements(balances) {
  // split into debtors & creditors
  const creditors = [];
  const debtors  = [];
  for (const [person, bal] of Object.entries(balances)) {
    if (bal > 0) creditors.push({ person, bal });
    else if (bal < 0) debtors.push({ person, bal });
  }

  // sort largest creditor first, largest debtor (most negative) first
  creditors.sort((a, b) => b.bal - a.bal);
  debtors.sort((a, b) => a.bal - b.bal);

  const txns = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(creditor.bal, -debtor.bal);

    txns.push({
      from:   debtor.person,
      to:     creditor.person,
      amount: Math.round(amount * 100) / 100
    });

    // update balances
    debtor.bal   += amount;
    creditor.bal -= amount;

    // advance pointers if one is settled
    if (Math.abs(debtor.bal) < 1e-6) i++;
    if (Math.abs(creditor.bal) < 1e-6) j++;
  }

  return txns;
}

module.exports = { calculateBalances, calculateSettlements };
