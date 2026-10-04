const budgetInput = document.getElementById("budgetInput");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");

const budgetDisplay = document.getElementById("budgetDisplay");
const expenseDisplay = document.getElementById("expenseDisplay");
const remainingDisplay = document.getElementById("remainingDisplay");
const tableTotal = document.getElementById("tableTotal");
const expenseTable = document.getElementById("expenseTable");
const statusMessage = document.getElementById("statusMessage");

const setBudgetBtn = document.getElementById("setBudgetBtn");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const clearBtn = document.getElementById("clearBtn");

let budget = Number(localStorage.getItem("simpleBudget")) || 0;
let expenses = JSON.parse(localStorage.getItem("simpleExpenses")) || [];

function peso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function saveData() {
  localStorage.setItem("simpleBudget", budget);
  localStorage.setItem("simpleExpenses", JSON.stringify(expenses));
}

function calculateTotalExpenses() {
  return expenses.reduce((total, item) => total + Number(item.amount), 0);
}

function updateSummary() {
  const totalExpenses = calculateTotalExpenses();
  const remaining = budget - totalExpenses;

  budgetDisplay.textContent = peso(budget);
  expenseDisplay.textContent = peso(totalExpenses);
  remainingDisplay.textContent = peso(remaining);
  tableTotal.textContent = peso(totalExpenses);

  statusMessage.className = "status";

  if (budget === 0) {
    statusMessage.textContent =
      "Set your allowance or budget first, then start adding expenses.";
  } else if (remaining < 0) {
    statusMessage.classList.add("danger");
    statusMessage.textContent =
      "You exceeded your budget by " + peso(Math.abs(remaining)) + ".";
  } else if (remaining <= budget * 0.2) {
    statusMessage.classList.add("warning");
    statusMessage.textContent =
      "Warning: You only have " + peso(remaining) + " remaining.";
  } else {
    statusMessage.textContent =
      "You still have " + peso(remaining) + " remaining from your budget.";
  }
}

function renderExpenses() {
  if (expenses.length === 0) {
    expenseTable.innerHTML = `
      <tr>
        <td colspan="4" class="empty">No expenses added yet.</td>
      </tr>
    `;
  } else {
    expenseTable.innerHTML = expenses
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.name)}</td>
            <td>${peso(item.amount)}</td>
            <td>
              <button class="delete-btn" onclick="deleteExpense(${index})">
                Delete
              </button>
            </td>
          </tr>
        `
      )
      .join("");
  }

  updateSummary();
}

function setBudget() {
  const value = Number(budgetInput.value);

  if (budgetInput.value.trim() === "" || value < 0) {
    alert("Please enter a valid allowance or budget.");
    return;
  }

  budget = value;
  budgetInput.value = "";
  saveData();
  updateSummary();
}

function addExpense() {
  const name = expenseName.value.trim();
  const amount = Number(expenseAmount.value);

  if (name === "") {
    alert("Please enter the expense name.");
    return;
  }

  if (expenseAmount.value.trim() === "" || amount <= 0) {
    alert("Please enter a valid expense amount.");
    return;
  }

  expenses.push({
    name: name,
    amount: amount
  });

  expenseName.value = "";
  expenseAmount.value = "";

  saveData();
  renderExpenses();

  expenseName.focus();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveData();
  renderExpenses();
}

function clearAll() {
  if (!confirm("Do you want to clear all expenses?")) {
    return;
  }

  expenses = [];
  saveData();
  renderExpenses();
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setBudgetBtn.addEventListener("click", setBudget);
addExpenseBtn.addEventListener("click", addExpense);
clearBtn.addEventListener("click", clearAll);

expenseAmount.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addExpense();
  }
});

window.deleteExpense = deleteExpense;

renderExpenses();
