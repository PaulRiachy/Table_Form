document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('userForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const gender = document.getElementById('gender');
  const saveBtn = document.getElementById('saveBtn');
  const tableBody = document.getElementById('tableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const timerDisplay = document.getElementById('timerDisplay');

  let users = [];
  let timeLeft = 60;
  let timerInterval = null;

  function loadUsers() {
    const saved = localStorage.getItem('users');
    if (saved) {
      try {
        users = JSON.parse(saved);
      } catch (e) {
        users = [];
      }
    }
    renderTable();
  }

  function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
  }

  function renderTable() {
    tableBody.innerHTML = '';

    if (users.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none';

    users.forEach((user, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.gender}</td>
        <td><button type="button" class="delete-btn" data-index="${index}">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  function startTimer() {
    if (users.length === 0 || timerInterval !== null) {
      return;
    }

    timeLeft = 60;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        resetTimer();
        localStorage.removeItem('users');
        users = [];
        renderTable();

        alert('Time expired. All saved data has been cleared.');
      }
    }, 1000);
  }

  function resetTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
  }

  function isValidName(name) {
    const trimmed = name.trim();
    const hasNoNumbers = !/\d/.test(trimmed);
    const isAtLeastTwoChars = trimmed.length >= 2;
    
    return hasNoNumbers && isAtLeastTwoChars;
  }

  function checkInputs() {
    const fnValid = isValidName(firstName.value);
    const lnValid = isValidName(lastName.value);
    const genderValid = gender.value !== '';

    saveBtn.disabled = !(fnValid && lnValid && genderValid);
  }

  [firstName, lastName, gender].forEach(input => {
    input.addEventListener('input', checkInputs);
    input.addEventListener('change', checkInputs);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUser = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      gender: gender.value
    };

    users.push(newUser);
    saveUsers();
    renderTable();

    startTimer();

    form.reset();
    saveBtn.disabled = true;
  });

  tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const index = e.target.getAttribute('data-index');
      if (index !== null) {
        users.splice(index, 1);
        saveUsers();
        renderTable();

        if (users.length === 0) {
          resetTimer();
        }
      }
    }
  });

  loadUsers();
  
  if (users.length > 0) {
    startTimer();
  }
});