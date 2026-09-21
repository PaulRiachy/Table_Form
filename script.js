document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('userForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const gender = document.getElementById('gender');
  const saveBtn = document.getElementById('saveBtn');
  const tableBody = document.getElementById('tableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const timerDisplay = document.getElementById('timerDisplay');

  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const genderError = document.getElementById('genderError');

  let users = [];
  let timeLeft = 60;
  let timerInterval = null;
  let editingIndex = null;

  function loadUsers() {
    const saved = localStorage.getItem('users');

    if (saved) {
      try {
        users = JSON.parse(saved);
      }
      catch (e) {
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
        <td>${index + 1}</td>
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.gender}</td>
        <td>
          <button
            type="button"
            class="edit-btn"
            data-id="${user.id}">
            Edit
          </button>
        </td>
        <td>
          <button
            type="button"
            class="delete-btn"
            data-id="${user.id}">
            Delete
          </button>
        </td>
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

        editingIndex = null;

        renderTable();

        form.reset();

        saveBtn.disabled = true;

        alert('Time expired. All saved data has been cleared.');
      }
    }, 1000);
  }

  function pauseTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resumeTimer() {
    if (users.length === 0 || timerInterval !== null) {
      return;
    }

    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;

      if (timeLeft <= 0) {
        resetTimer();

        localStorage.removeItem('users');

        users = [];

        editingIndex = null;

        renderTable();

        form.reset();

        saveBtn.disabled = true;

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

  function checkInputs() {
    const fnValue = firstName.value.trim();
    const lnValue = lastName.value.trim();
    const genderValue = gender.value;

    const allFieldsFilled =
      fnValue !== '' &&
      lnValue !== '' &&
      genderValue !== '';

    if (editingIndex !== null) {
      saveBtn.disabled = true;
      return;
    }

    saveBtn.disabled = !allFieldsFilled;
  }

  function validateInputs() {
    const fnValue = firstName.value.trim();
    const lnValue = lastName.value.trim();
    const genderValue = gender.value;

    let valid = true;

    if (fnValue === '') {
      firstNameError.textContent = 'First Name is required.';
      valid = false;
    }
    else if (!/^[A-Za-z\s]+$/.test(fnValue)) {
      firstNameError.textContent =
        'First Name can only contain letters and spaces.';
      valid = false;
    }
    else if (fnValue.length < 4) {
      firstNameError.textContent =
        'First Name must be at least 4 characters.';
      valid = false;
    }
    else {
      firstNameError.textContent = '';
    }

    if (lnValue === '') {
      lastNameError.textContent = 'Last Name is required.';
      valid = false;
    }
    else if (!/^[A-Za-z\s]+$/.test(lnValue)) {
      lastNameError.textContent =
        'Last Name can only contain letters and spaces.';
      valid = false;
    }
    else if (lnValue.length < 3) {
      lastNameError.textContent =
        'Last Name must be at least 3 characters.';
      valid = false;
    }
    else {
      lastNameError.textContent = '';
    }

    if (genderValue === '') {
      genderError.textContent = 'Gender is required.';
      valid = false;
    }
    else {
      genderError.textContent = '';
    }

    return valid;
  }

  [firstName, lastName, gender].forEach(input => {
    input.addEventListener('input', checkInputs);
    input.addEventListener('change', checkInputs);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      return;
    }

    if (!validateInputs()) {
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
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
    if (e.target.classList.contains('edit-btn')) {
      const id = e.target.getAttribute('data-id');

      const user = users.find(user => user.id === id);

      if (!user) {
        return;
      }

      firstName.value = user.firstName;
      lastName.value = user.lastName;
      gender.value = user.gender;

      editingIndex = id;

      pauseTimer();

      saveBtn.disabled = true;

      firstNameError.textContent = '';
      lastNameError.textContent = '';
      genderError.textContent = '';

      e.target.textContent = 'Save';

      e.target.classList.remove('edit-btn');
      e.target.classList.add('edit-save-btn');

      return;
    }

    if (e.target.classList.contains('edit-save-btn')) {
      const id = e.target.getAttribute('data-id');

      if (!validateInputs()) {
        return;
      }

      const user = users.find(user => user.id === id);

      if (!user) {
        return;
      }

      user.firstName = firstName.value.trim();
      user.lastName = lastName.value.trim();
      user.gender = gender.value;

      saveUsers();

      editingIndex = null;

      form.reset();

      saveBtn.disabled = true;

      renderTable();

      resumeTimer();

      return;
    }

    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.getAttribute('data-id');

      const index = users.findIndex(user => user.id === id);

      if (index !== -1) {
        users.splice(index, 1);

        saveUsers();

        if (editingIndex === id) {
          editingIndex = null;

          form.reset();

          firstNameError.textContent = '';
          lastNameError.textContent = '';
          genderError.textContent = '';

          saveBtn.disabled = true;
        }

        renderTable();

        if (users.length === 0) {
          resetTimer();
        }
        else if (editingIndex === null && timerInterval === null) {
          resumeTimer();
        }
      }
    }
  });

  loadUsers();

  if (users.length > 0) {
    startTimer();
  }
});