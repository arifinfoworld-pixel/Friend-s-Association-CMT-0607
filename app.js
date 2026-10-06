(() => {
  'use strict';

  const STORAGE_KEY = 'bondhu-association-v1';
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const dateDaysAgo = days => { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString().slice(0, 10); };
  const starterData = {
    members: [
      { id: 'm1', name: 'Aminul Islam', phone: '+880 1712-345678', email: 'aminul@example.com', joined: '2024-01-12' },
      { id: 'm2', name: 'Nusrat Jahan', phone: '+880 1815-234567', email: 'nusrat@example.com', joined: '2024-02-03' },
      { id: 'm3', name: 'Farhan Ahmed', phone: '+880 1911-456789', email: 'farhan@example.com', joined: '2024-02-18' },
      { id: 'm4', name: 'Sadia Rahman', phone: '+880 1613-567890', email: 'sadia@example.com', joined: '2024-03-09' },
      { id: 'm5', name: 'Tanvir Hasan', phone: '+880 1514-678901', email: 'tanvir@example.com', joined: '2024-04-22' },
      { id: 'm6', name: 'Maliha Chowdhury', phone: '+880 1716-789012', email: 'maliha@example.com', joined: '2024-05-14' },
      { id: 'm7', name: 'Rakibul Haque', phone: '+880 1817-890123', email: 'rakib@example.com', joined: '2024-06-01' },
      { id: 'm8', name: 'Samira Akter', phone: '+880 1918-901234', email: 'samira@example.com', joined: '2024-07-16' }
    ],
    contributions: [
      { id: 'c1', memberId: 'm1', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(1) },
      { id: 'c2', memberId: 'm2', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(2) },
      { id: 'c3', memberId: 'm3', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(4) },
      { id: 'c4', memberId: 'm4', amount: 7500, note: 'Monthly contribution + donation', date: dateDaysAgo(8) },
      { id: 'c5', memberId: 'm5', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(12) },
      { id: 'c6', memberId: 'm6', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(16) },
      { id: 'c7', memberId: 'm7', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(21) },
      { id: 'c8', memberId: 'm8', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(27) },
      { id: 'c9', memberId: 'm1', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(36) },
      { id: 'c10', memberId: 'm2', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(45) },
      { id: 'c11', memberId: 'm3', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(58) },
      { id: 'c12', memberId: 'm4', amount: 5000, note: 'Monthly contribution', date: dateDaysAgo(74) }
    ],
    expenses: [
      { id: 'e1', title: 'Community iftar gathering', category: 'Events', amount: 12500, note: 'Food and venue', date: dateDaysAgo(5) },
      { id: 'e2', title: 'Monthly meeting', category: 'Meetings', amount: 3200, note: 'Refreshments and room', date: dateDaysAgo(18) },
      { id: 'e3', title: 'Member support fund', category: 'Welfare', amount: 8000, note: 'Emergency assistance', date: dateDaysAgo(34) },
      { id: 'e4', title: 'Association stationery', category: 'Operations', amount: 1450, note: 'Registers and supplies', date: dateDaysAgo(63) }
    ],
    investments: [
      { id: 'i1', title: 'Monthly savings deposit', type: 'Savings', amount: 20000, startDate: dateDaysAgo(48), maturityDate: '' },
      { id: 'i2', title: 'Fixed deposit account', type: 'Fixed deposit', amount: 30000, startDate: dateDaysAgo(140), maturityDate: '2027-02-17' }
    ],
    accounts: [],
    audit: []
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(starterData);
      const value = JSON.parse(raw);
      return {
        members: Array.isArray(value.members) ? value.members : [],
        contributions: Array.isArray(value.contributions) ? value.contributions : [],
        expenses: Array.isArray(value.expenses) ? value.expenses : [],
        investments: Array.isArray(value.investments) ? value.investments : [],
        accounts: Array.isArray(value.accounts) ? value.accounts : [],
        audit: Array.isArray(value.audit) ? value.audit : []
      };
    } catch (error) {
      console.warn('Unable to load saved association data.', error);
      return structuredClone(starterData);
    }
  }

  let data = loadData();
  let currentUser = null;
  let authMode = 'login';
  let role = 'member';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const money = amount => '৳' + new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(Number(amount) || 0);
  const dateLabel = value => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '—';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const id = prefix => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const total = list => list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const getMember = memberId => data.members.find(member => member.id === memberId);

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (error) { console.error('Unable to save association data.', error); showToast('Could not save. Check your browser storage settings.'); }
  }

  function recordAudit(action, detail) {
    data.audit.unshift({ id: id('a'), at: new Date().toISOString(), userId: currentUser?.id || 'system', userName: currentUser?.name || 'System', role: currentUser?.role || 'system', action, detail });
    data.audit = data.audit.slice(0, 1000);
  }

  async function passwordHash(password, salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
    return [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function seedDemoAccounts() {
    const demos = [
      ['admin@bondhu.local', 'Bondhu Admin', 'admin'],
      ['accounts@bondhu.local', 'Association Accountant', 'accountant'],
      ['member@bondhu.local', 'Demo Member', 'member']
    ];
    for (const [email, name, accountRole] of demos) {
      if (!data.accounts.some(account => account.email === email)) {
        const salt = `bondhu-demo-${accountRole}-local-only`;
        data.accounts.push({ id: `demo-${accountRole}`, email, name, role: accountRole, memberId: accountRole === 'member' ? 'm1' : null, salt, passwordHash: await passwordHash('bondhu123', salt) });
      }
    }
    save();
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function transactionRows() {
    const contributions = data.contributions.filter(item => role !== 'member' || item.memberId === currentUser?.memberId).map(item => ({ ...item, kind: 'income', label: getMember(item.memberId)?.name || 'Removed member', detail: `${item.type || 'monthly'} · ${item.note || 'Contribution'}`, date: item.date }));
    const expenses = (role === 'member' ? [] : data.expenses).map(item => ({ ...item, kind: 'expense', label: item.title, detail: item.category, date: item.date }));
    const investments = (role === 'member' ? [] : data.investments).map(item => ({ ...item, kind: 'investment', label: item.title, detail: item.type, date: item.startDate }));
    return [...contributions, ...expenses, ...investments].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  function renderStats() {
    const memberContributions = role === 'member' ? data.contributions.filter(item => item.memberId === currentUser?.memberId) : data.contributions;
    const memberExpenses = role === 'member' ? [] : data.expenses;
    const memberInvestments = role === 'member' ? [] : data.investments;
    const contributionSum = total(memberContributions);
    const expenseSum = total(memberExpenses);
    const investmentSum = total(memberInvestments);
    const balance = contributionSum - expenseSum;
    $('#statBalance').textContent = money(balance);
    $('#statContributions').textContent = money(contributionSum);
    $('#statExpenses').textContent = money(expenseSum);
    $('#statMembers').textContent = (role === 'member' ? (currentUser?.memberId ? 1 : 0) : data.members.length).toLocaleString('en-BD');
    $('#contributionCount').textContent = `${memberContributions.length} contribution${memberContributions.length === 1 ? '' : 's'} recorded`;
    $('#expenseCount').textContent = `${memberExpenses.length} expense${memberExpenses.length === 1 ? '' : 's'} recorded`;
    $('#memberNavCount').textContent = role === 'member' ? '1' : data.members.length;
    $('#fundSnapshot').textContent = money(balance);
    $('#snapshotContributions').textContent = money(contributionSum);
    $('#snapshotExpenses').textContent = money(expenseSum);
    $('#snapshotInvestments').textContent = money(investmentSum);
    $('#contributionTotalPage').textContent = money(contributionSum);
    $('#contributionTransactions').textContent = memberContributions.length;
    $('#contributionAverage').textContent = money(memberContributions.length ? contributionSum / memberContributions.length : 0);
    $('#expenseTotalPage').textContent = money(expenseSum);
    $('#expenseTransactions').textContent = memberExpenses.length;
    $('#expenseAverage').textContent = money(memberExpenses.length ? expenseSum / memberExpenses.length : 0);
    $('#investmentTotalPage').textContent = money(investmentSum);
    $('#investmentCountPage').textContent = memberInvestments.length;
    $('#investmentSharePage').textContent = `${contributionSum ? Math.round(investmentSum / contributionSum * 100) : 0}%`;
    $('#reportContributions').textContent = money(contributionSum);
    $('#reportExpenses').textContent = money(expenseSum);
    $('#reportBalance').textContent = money(balance);
    $('#reportInvestments').textContent = money(investmentSum);
    $('#reportDate').textContent = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  }

  function renderChart() {
    const months = Array.from({ length: 12 }, (_, index) => index);
    const now = new Date();
    const income = months.map(month => data.contributions.filter(item => (role !== 'member' || item.memberId === currentUser?.memberId) && new Date(`${item.date}T00:00:00`).getFullYear() === now.getFullYear() && new Date(`${item.date}T00:00:00`).getMonth() === month).reduce((sum, item) => sum + Number(item.amount), 0));
    const expenses = months.map(month => (role === 'member' ? [] : data.expenses).filter(item => { const date = new Date(`${item.date}T00:00:00`); return date.getFullYear() === now.getFullYear() && date.getMonth() === month; }).reduce((sum, item) => sum + Number(item.amount), 0));
    const max = Math.max(1, ...income, ...expenses);
    $('#overviewChart').innerHTML = months.map((month, index) => `<div class="chart-month" title="${new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(now.getFullYear(), month, 1))}: ${money(income[index])} contributions, ${money(expenses[index])} expenses"><span class="chart-bar income" style="height:${income[index] ? Math.max(5, income[index] / max * 92) : 3}%"></span><span class="chart-bar outcome" style="height:${expenses[index] ? Math.max(5, expenses[index] / max * 92) : 3}%"></span></div>`).join('');
  }

  function renderRecent() {
    const rows = transactionRows().slice(0, 6);
    $('#recentActivity').innerHTML = rows.length ? rows.map(item => `<tr><td><div class="transaction-name"><span class="transaction-symbol ${item.kind === 'income' ? 'symbol-income' : item.kind === 'expense' ? 'symbol-expense' : 'symbol-investment'}">${item.kind === 'income' ? '↗' : item.kind === 'expense' ? '↘' : '◈'}</span>${escapeHTML(item.label)}</div></td><td>${escapeHTML(item.detail)}</td><td>${dateLabel(item.date)}</td><td>${typeBadge(item.kind)}</td><td class="align-right ${item.kind === 'income' ? 'amount-positive' : item.kind === 'expense' ? 'amount-negative' : ''}">${item.kind === 'expense' ? '−' : item.kind === 'income' ? '+' : ''}${money(item.amount)}</td></tr>`).join('') : emptyRow(5, 'No activity yet');
  }

  function typeBadge(kind) {
    const label = kind === 'income' ? 'Contribution' : kind === 'expense' ? 'Expense' : 'Investment';
    return `<span class="type-badge ${kind}"><i class="legend-dot legend-${kind}"></i>${label}</span>`;
  }

  function emptyRow(columns, message) { return `<tr><td colspan="${columns}" style="text-align:center;color:#9aa8a2;padding:24px 8px">${message}</td></tr>`; }

  function renderMembers() {
    const query = ($('#memberSearch')?.value || '').trim().toLowerCase();
    const visibleMembers = role === 'member' ? data.members.filter(member => member.id === currentUser?.memberId) : data.members;
    const members = visibleMembers.filter(member => [member.name, member.phone, member.email].some(value => (value || '').toLowerCase().includes(query)));
    $('#memberResultCount').textContent = `${members.length} member${members.length === 1 ? '' : 's'}`;
    $('#membersEmpty').classList.toggle('hidden', members.length !== 0);
    $('#membersTable').innerHTML = members.map(member => {
      const contributed = total(data.contributions.filter(item => item.memberId === member.id));
      const initials = member.name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
      return `<tr><td><div class="member-person"><span class="member-avatar">${escapeHTML(initials)}</span><span><strong>${escapeHTML(member.name)}</strong><small>${escapeHTML(member.email || '—')}</small></span></div></td><td>${escapeHTML(member.phone || '—')}</td><td>${dateLabel(member.joined)}</td><td class="amount-positive">${money(contributed)}</td><td><span class="status-active">Active</span></td><td class="align-right">${role === 'admin' ? `<button class="icon-button" data-delete-member="${escapeHTML(member.id)}" title="Delete ${escapeHTML(member.name)}" aria-label="Delete ${escapeHTML(member.name)}">⌫</button>` : ''}</td></tr>`;
    }).join('');
  }

  function renderContributions() {
    const query = ($('#contributionSearch')?.value || '').trim().toLowerCase();
    const type = $('#contributionTypeFilter')?.value || 'all';
    const rows = [...data.contributions].filter(item => role !== 'member' || item.memberId === currentUser?.memberId).filter(item => (type === 'all' || (item.type || 'monthly') === type) && [getMember(item.memberId)?.name, item.note, item.type].some(value => (value || '').toLowerCase().includes(query))).sort((a, b) => b.date.localeCompare(a.date));
    $('#contributionsTable').innerHTML = rows.length ? rows.map(item => `<tr><td><div class="member-person"><span class="member-avatar">${escapeHTML((getMember(item.memberId)?.name || 'RM').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase())}</span><span><strong>${escapeHTML(getMember(item.memberId)?.name || 'Removed member')}</strong><small>${escapeHTML(getMember(item.memberId)?.email || '')}</small></span></div></td><td><span class="type-badge income">${escapeHTML((item.type || 'monthly').replace(/^./, text => text.toUpperCase()))}</span></td><td>${escapeHTML(item.note || 'Contribution')}</td><td>${dateLabel(item.date)}</td><td class="align-right amount-positive">+${money(item.amount)}</td></tr>`).join('') : '';
    $('#contributionsEmpty').classList.toggle('hidden', rows.length !== 0);
  }

  function renderExpenses() {
    const rows = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date));
    $('#expensesTable').innerHTML = rows.map(item => `<tr><td><div class="transaction-name"><span class="transaction-symbol symbol-expense">↘</span>${escapeHTML(item.title)}</div></td><td>${escapeHTML(item.category)}</td><td>${dateLabel(item.date)}</td><td class="subtext">${escapeHTML(item.note || '—')}</td><td class="align-right amount-negative">−${money(item.amount)}</td></tr>`).join('');
    $('#expensesEmpty').classList.toggle('hidden', rows.length !== 0);
  }

  function renderInvestments() {
    const rows = [...data.investments].sort((a, b) => b.startDate.localeCompare(a.startDate));
    $('#investmentsTable').innerHTML = rows.map(item => `<tr><td><div class="transaction-name"><span class="transaction-symbol symbol-investment">◈</span>${escapeHTML(item.title)}</div></td><td>${escapeHTML(item.type)}</td><td>${dateLabel(item.startDate)}</td><td>${dateLabel(item.maturityDate)}</td><td class="align-right">${money(item.amount)}</td></tr>`).join('');
    $('#investmentsEmpty').classList.toggle('hidden', rows.length !== 0);
  }

  function renderReport() {
    const rows = transactionRows();
    $('#reportTransactionCount').textContent = `${rows.length} transaction${rows.length === 1 ? '' : 's'}`;
    $('#reportTable').innerHTML = rows.map(item => `<tr><td><div class="transaction-name"><span class="transaction-symbol ${item.kind === 'income' ? 'symbol-income' : item.kind === 'expense' ? 'symbol-expense' : 'symbol-investment'}">${item.kind === 'income' ? '↗' : item.kind === 'expense' ? '↘' : '◈'}</span>${escapeHTML(item.label)}</div></td><td>${escapeHTML(item.detail)}</td><td>${dateLabel(item.date)}</td><td>${typeBadge(item.kind)}</td><td class="align-right ${item.kind === 'income' ? 'amount-positive' : item.kind === 'expense' ? 'amount-negative' : ''}">${item.kind === 'expense' ? '−' : item.kind === 'income' ? '+' : ''}${money(item.amount)}</td></tr>`).join('');
    $('#reportEmpty').classList.toggle('hidden', rows.length !== 0);
  }

  function renderAudit() {
    const events = data.audit || [];
    $('#auditTable').innerHTML = events.map(event => `<tr><td>${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.at))}</td><td>${escapeHTML(event.userName)}</td><td><span class="status-active">${escapeHTML(event.role)}</span></td><td>${escapeHTML(event.action)}</td><td>${escapeHTML(event.detail)}</td></tr>`).join('');
    $('#auditEmpty').classList.toggle('hidden', events.length !== 0);
  }

  function renderCertificate() {
    const members = role === 'member' ? data.members.filter(member => member.id === currentUser?.memberId) : data.members;
    const select = $('#certificateMember');
    const previous = select.value;
    select.innerHTML = members.length ? members.map(member => `<option value="${escapeHTML(member.id)}">${escapeHTML(member.name)}</option>`).join('') : '<option value="">No members available</option>';
    if (members.some(member => member.id === previous)) select.value = previous;
    updateCertificate();
  }

  function updateCertificate() {
    const member = getMember($('#certificateMember').value);
    const entries = data.contributions.filter(item => member && item.memberId === member.id);
    $('#certificateContributions').textContent = money(total(entries));
    $('#certificateCount').textContent = entries.length.toLocaleString('en-BD');
    $('#certificateAsOf').textContent = dateLabel(todayISO());
    $('#certificateDateLine').textContent = dateLabel(todayISO());
  }

  function render() {
    renderStats(); renderChart(); renderRecent(); renderMembers(); renderContributions(); renderExpenses(); renderInvestments(); renderReport(); renderAudit(); renderCertificate();
  }

  const field = (name, label, type = 'text', options = {}) => {
    const full = options.full ? ' full' : '';
    let control;
    if (options.select) control = `<select name="${name}" ${options.required === false ? '' : 'required'}>${options.select.map(([value, text]) => `<option value="${escapeHTML(value)}">${escapeHTML(text)}</option>`).join('')}</select>`;
    else if (options.textarea) control = `<textarea name="${name}" placeholder="${escapeHTML(options.placeholder || '')}" ${options.required === false ? '' : 'required'}></textarea>`;
    else control = `<input name="${name}" type="${type}" ${options.required === false ? '' : 'required'} ${options.min !== undefined ? `min="${options.min}"` : ''} ${options.step ? `step="${options.step}"` : ''} placeholder="${escapeHTML(options.placeholder || '')}" value="${escapeHTML(options.value || '')}" />`;
    return `<div class="form-field${full}"><label>${label}</label>${control}</div>`;
  };

  let activeFormType = '';
  function openModal(type) {
    activeFormType = type;
    if ((type === 'member' && role !== 'admin') || (['contribution', 'expense', 'investment'].includes(type) && !['admin', 'accountant'].includes(role))) { showToast('Your account does not have permission for this action.'); return; }
    const forms = {
      member: { title: 'Add a member', eyebrow: 'GROW YOUR COMMUNITY', button: 'Add member', fields: field('name', 'FULL NAME', 'text', { placeholder: 'e.g. Ayesha Rahman' }) + field('phone', 'PHONE NUMBER', 'tel', { placeholder: '+880 1XXX-XXXXXX' }) + field('email', 'EMAIL ADDRESS', 'email', { placeholder: 'name@example.com', required: false }) + field('joined', 'JOIN DATE', 'date', { value: todayISO() }) },
      contribution: { title: 'Record a contribution', eyebrow: 'MONEY IN', button: 'Save contribution', fields: field('memberId', 'MEMBER', 'text', { select: data.members.length ? data.members.map(member => [member.id, member.name]) : [['', 'Add a member first']] }) + field('type', 'CONTRIBUTION TYPE', 'text', { select: [['monthly', 'Monthly contribution'], ['yearly', 'Yearly contribution'], ['other', 'Other contribution']] }) + field('amount', 'AMOUNT (BDT)', 'number', { placeholder: 'e.g. 5000', min: '0.01', step: '0.01' }) + field('period', 'PERIOD (OPTIONAL)', 'month', { required: false }) + field('note', 'NOTE / DESCRIPTION', 'text', { placeholder: 'Contribution details', full: true }) + field('date', 'DATE', 'date', { value: todayISO() }) },
      expense: { title: 'Add an expense', eyebrow: 'MONEY OUT', button: 'Save expense', fields: field('title', 'EXPENSE NAME', 'text', { placeholder: 'e.g. Community event', full: true }) + field('amount', 'AMOUNT (BDT)', 'number', { placeholder: 'e.g. 2500', min: '0.01', step: '0.01' }) + field('category', 'CATEGORY', 'text', { select: [['Operations', 'Operations'], ['Events', 'Events'], ['Meetings', 'Meetings'], ['Welfare', 'Welfare'], ['Travel', 'Travel'], ['Other', 'Other']] }) + field('note', 'NOTE', 'text', { placeholder: 'Optional details', full: true, required: false }) + field('date', 'DATE', 'date', { value: todayISO() }) },
      investment: { title: 'Add an investment', eyebrow: 'MONEY FOR TOMORROW', button: 'Save investment', fields: field('title', 'INVESTMENT NAME', 'text', { placeholder: 'e.g. Fixed deposit', full: true }) + field('amount', 'AMOUNT (BDT)', 'number', { placeholder: 'e.g. 10000', min: '0.01', step: '0.01' }) + field('type', 'INVESTMENT TYPE', 'text', { select: [['Savings', 'Savings'], ['Fixed deposit', 'Fixed deposit'], ['Business', 'Business'], ['Other', 'Other']] }) + field('startDate', 'START DATE', 'date', { value: todayISO() }) + field('maturityDate', 'MATURITY DATE', 'date', { required: false }) }
    };
    const form = forms[type];
    if (type === 'contribution' && !data.members.length) { showToast('Add a member before recording a contribution.'); return; }
    $('#modalTitle').textContent = form.title;
    $('#modalEyebrow').textContent = form.eyebrow;
    $('#saveRecord').textContent = form.button;
    $('#modalFields').innerHTML = form.fields;
    $('#modalBackdrop').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    $('#modalFields input')?.focus();
  }

  function closeModal() { $('#modalBackdrop').classList.add('hidden'); document.body.style.overflow = ''; $('#recordForm').reset(); }

  $('#recordForm').addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (activeFormType === 'member') {
      const member = { id: id('m'), name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim(), joined: values.joined };
      data.members.push(member);
      recordAudit('Member added', member.name);
      showToast('Member added successfully.');
    } else if (activeFormType === 'contribution') {
      const contribution = { id: id('c'), memberId: values.memberId, amount: Number(values.amount), type: values.type, note: values.note.trim() || 'Contribution', date: values.date, period: values.period || '' };
      data.contributions.push(contribution);
      recordAudit('Contribution recorded', `${values.type} · ${getMember(values.memberId)?.name || 'member'} · ${money(values.amount)}`);
      showToast('Contribution recorded successfully.');
    } else if (activeFormType === 'expense') {
      data.expenses.push({ id: id('e'), title: values.title.trim(), amount: Number(values.amount), category: values.category, note: values.note.trim(), date: values.date });
      recordAudit('Expense recorded', `${values.title} · ${money(values.amount)}`);
      showToast('Expense added successfully.');
    } else if (activeFormType === 'investment') {
      data.investments.push({ id: id('i'), title: values.title.trim(), amount: Number(values.amount), type: values.type, startDate: values.startDate, maturityDate: values.maturityDate });
      recordAudit('Investment recorded', `${values.title} · ${money(values.amount)}`);
      showToast('Investment added successfully.');
    }
    save(); closeModal(); render();
  });

  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action) openModal(action.replace('add-', ''));
    const nav = event.target.closest('[data-page], [data-page-link]');
    if (nav) { event.preventDefault(); navigate(nav.dataset.page || nav.dataset.pageLink); }
    const removeButton = event.target.closest('[data-delete-member]');
    if (removeButton) {
      const member = getMember(removeButton.dataset.deleteMember);
      if (member && window.confirm(`Delete ${member.name}? Their contribution records will remain in the ledger.`)) {
        data.members = data.members.filter(item => item.id !== member.id);
        data.accounts = data.accounts.filter(account => account.memberId !== member.id);
        recordAudit('Member deleted', member.name);
        save(); render(); showToast(`${member.name} removed.`);
      }
    }
  });

  function navigate(page) {
    if (!document.querySelector(`#page-${page}`)) return;
    const accessible = role === 'member' ? !['audit', 'expenses', 'investments'].includes(page) : page !== 'audit' || ['admin', 'accountant'].includes(role);
    if (!accessible) { page = 'dashboard'; showToast('Your account does not have permission to view that page.'); }
    $$('.page').forEach(element => element.classList.toggle('active', element.id === `page-${page}`));
    $$('.nav-link').forEach(element => element.classList.toggle('active', element.dataset.page === page));
    $('#pageCrumb').textContent = ({ dashboard: 'Dashboard', members: 'Member management', contributions: 'Contributions', expenses: 'Expenses', investments: 'Investments', reports: 'Reports', certificate: 'Balance certificate', audit: 'Audit log', calculator: 'BDT calculator' })[page] || 'Dashboard';
    history.replaceState(null, '', `#${page}`);
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('open'); }
  $('#mobileMenu').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#sidebarOverlay').classList.add('open'); });
  $('#sidebarOverlay').addEventListener('click', closeSidebar);
  $('#memberSearch').addEventListener('input', renderMembers);
  $('#calcAmount').addEventListener('input', calculate);
  $('#calcMembers').addEventListener('input', calculate);
  function calculate() {
    const amount = Number($('#calcAmount').value) || 0;
    const members = Number($('#calcMembers').value) || 0;
    $('#calcResult').textContent = `৳${new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(members ? amount / members : 0)}`;
  }
  $('#printReport').addEventListener('click', () => window.print());
  $('#printCertificate').addEventListener('click', () => { document.body.classList.add('print-certificate'); window.print(); });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-certificate'));
  $('#certificateMember').addEventListener('change', updateCertificate);
  $('#contributionSearch').addEventListener('input', renderContributions);
  $('#contributionTypeFilter').addEventListener('change', renderContributions);
  document.addEventListener('click', event => {
    const exportType = event.target.closest('[data-export]')?.dataset.export;
    if (exportType) exportCSV(exportType);
  });

  function exportCSV(type) {
    let headers; let rows; let filename;
    if (type === 'contributions') {
      headers = ['Member', 'Contribution type', 'Period', 'Note', 'Date', 'Amount (BDT)'];
      rows = data.contributions.filter(item => role !== 'member' || item.memberId === currentUser?.memberId).map(item => [getMember(item.memberId)?.name || 'Removed member', item.type || 'monthly', item.period || '', item.note, item.date, item.amount]);
      filename = 'bondhu-contributions.csv';
    } else if (type === 'audit') {
      headers = ['Timestamp', 'User', 'Role', 'Action', 'Details'];
      rows = data.audit.map(item => [item.at, item.userName, item.role, item.action, item.detail]); filename = 'bondhu-audit-log.csv';
    } else {
      headers = ['Date', 'Type', 'Description', 'Detail', 'Amount (BDT)'];
      rows = transactionRows().map(item => [item.date, item.kind, item.label, item.detail, item.amount]); filename = 'bondhu-financial-report.csv';
    }
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
    recordAudit('Data exported', filename); save(); renderAudit(); showToast('Spreadsheet export downloaded.');
  }
  $('#modalClose').addEventListener('click', closeModal);
  $('#cancelModal').addEventListener('click', closeModal);
  $('#modalBackdrop').addEventListener('click', event => { if (event.target === $('#modalBackdrop')) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); closeSidebar(); } });
  $('#todayDate').textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date());
  $('#authSwitch').addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));
  $('#authForm').addEventListener('submit', handleAuthentication);
  $('#signOut').addEventListener('click', () => { if (currentUser) { recordAudit('Signed out', currentUser.email); save(); } sessionStorage.removeItem('bondhu-session'); currentUser = null; showAuth(); });

  function setAuthMode(mode) {
    authMode = mode;
    const registration = mode === 'register';
    $('#authTitle').textContent = registration ? 'Join your community' : 'Welcome back';
    $('#authSubtitle').textContent = registration ? 'Create a member account to view your own records.' : 'Sign in to your association account.';
    $('#authNameField').classList.toggle('hidden', !registration);
    $('#authName').required = registration;
    $('#authPassword').autocomplete = registration ? 'new-password' : 'current-password';
    $('#authSubmit').textContent = registration ? 'Create account' : 'Sign in';
    $('#authSwitchText').textContent = registration ? 'Already have an account?' : 'New to the association?';
    $('#authSwitch').textContent = registration ? 'Sign in' : 'Create member account';
    $('#authError').classList.add('hidden');
  }

  function showAuth() {
    $('#authScreen').classList.remove('hidden');
    $('#appRoot')?.classList.add('hidden');
    document.body.classList.add('auth-active');
  }

  function openWorkspace(user) {
    currentUser = user;
    role = user.role;
    sessionStorage.setItem('bondhu-session', user.id);
    $('#authScreen').classList.add('hidden');
    $('#appRoot')?.classList.remove('hidden');
    document.body.classList.remove('auth-active');
    $('#userName').textContent = user.name;
    $('#userAvatar').textContent = user.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    $('#certificateSigner').textContent = user.role === 'member' ? 'Member copy' : user.name;
    $$('.nav-link[data-roles]').forEach(link => { link.classList.toggle('role-hidden', !link.dataset.roles.split(',').includes(role)); });
    $$('[data-roles]').forEach(element => { if (!element.matches('.nav-link')) element.classList.toggle('role-hidden', !element.dataset.roles.split(',').includes(role)); });
    $$('.nav-link[data-page="expenses"], .nav-link[data-page="investments"]').forEach(link => link.classList.toggle('role-hidden', role === 'member'));
    if (role === 'member') {
      const personal = data.contributions.filter(item => item.memberId === user.memberId);
      $('#reportContributions').textContent = money(total(personal));
      $('#reportExpenses').textContent = '৳0'; $('#reportInvestments').textContent = '৳0'; $('#reportBalance').textContent = money(total(personal));
    }
    const firstPage = location.hash.slice(1);
    navigate(firstPage && $(`#page-${firstPage}`) && (firstPage !== 'audit' || role !== 'member') ? firstPage : 'dashboard');
    render();
  }

  async function handleAuthentication(event) {
    event.preventDefault();
    const email = $('#authEmail').value.trim().toLowerCase();
    const password = $('#authPassword').value;
    const fail = message => { $('#authError').textContent = message; $('#authError').classList.remove('hidden'); };
    $('#authError').classList.add('hidden');
    if (authMode === 'register') {
      const name = $('#authName').value.trim();
      if (!name) return fail('Enter your name.');
      if (data.accounts.some(account => account.email === email)) return fail('An account with this email already exists.');
      const member = data.members.find(item => (item.email || '').toLowerCase() === email);
      const account = { id: id('u'), email, name, role: 'member', memberId: member?.id || null, salt: crypto.randomUUID(), passwordHash: '' };
      account.passwordHash = await passwordHash(password, account.salt);
      if (!member) {
        const newMember = { id: id('m'), name, email, phone: '', joined: todayISO() };
        data.members.push(newMember); account.memberId = newMember.id;
      }
      data.accounts.push(account);
      currentUser = account; recordAudit('Member account registered', email); save(); openWorkspace(account); showToast('Welcome to the association.');
      return;
    }
    const account = data.accounts.find(item => item.email === email);
    if (!account || account.passwordHash !== await passwordHash(password, account.salt)) return fail('Email or password is incorrect.');
    currentUser = account; recordAudit('Signed in', email); save(); openWorkspace(account);
  }

  async function start() {
    await seedDemoAccounts();
    const sessionId = sessionStorage.getItem('bondhu-session');
    const user = data.accounts.find(account => account.id === sessionId);
    if (user) openWorkspace(user); else showAuth();
  }

  start();
})();
