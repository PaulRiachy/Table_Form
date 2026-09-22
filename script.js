document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('userForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const gender = document.getElementById('gender');
  const saveBtn = document.getElementById('saveBtn');
  const tableBody = document.getElementById('tableBody');
  const emptyMsg = document.getElementById('emptyMsg');
  const timerDisplay = document.getElementById('timerDisplay');
  const searchInput = document.getElementById('searchInput');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const genderFilters = document.querySelectorAll('.gender-filter');
  const deleteModal = document.getElementById('deleteModal');
  const deleteMessage = document.getElementById('deleteMessage');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const pagination = document.getElementById('pagination');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pageNumbers = document.getElementById('pageNumbers');
  const showingCount = document.getElementById('showingCount');
  const totalUsersStat = document.getElementById('totalUsersStat');
  const maleUsersStat = document.getElementById('maleUsersStat');
  const femaleUsersStat = document.getElementById('femaleUsersStat');

  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const genderError = document.getElementById('genderError');
  const duplicateError = document.getElementById('duplicateError');

  const sortHeaders = document.querySelectorAll('th[data-sort]');

  let users = [];
  let timeLeft = 60;
  let timerInterval = null;
  let editingIndex = null;
  let pendingDeleteId = null;

  let sortField = null;
  let sortDirection = 'asc';
  let selectedGender = 'all';
  let currentPage = 1;
  const usersPerPage = 5;



  clearAllBtn.addEventListener('click', () => {
    users = [];

    localStorage.removeItem('users');

    resetTimer();

    editingIndex = null;

    form.reset();

    firstNameError.textContent = '';
    lastNameError.textContent = '';
    genderError.textContent = '';
    duplicateError.textContent = '';

    saveBtn.disabled = true;

    searchInput.value = '';

    sortField = null;
    sortDirection = 'asc';

    updateSortArrows();

    renderTable();
  });

  function loadUsers() {
    const saved = localStorage.getItem('users');

    if (saved) {
      try {
        users = JSON.parse(saved);

        users.forEach((user, index) => {
          if (!user.displayId) {
            user.displayId = index + 1;
          }
        });

        saveUsers();
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

    updateStatistics();

    let displayedUsers = [...users];

    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue !== '') {
      displayedUsers = displayedUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue)
      );
    }

    if (selectedGender !== 'all') {
      displayedUsers = displayedUsers.filter(user =>
        user.gender === selectedGender
      );
    }

    if (sortField !== null) {
      displayedUsers.sort((a, b) => {
        const valueA = a[sortField].toLowerCase();
        const valueB = b[sortField].toLowerCase();

        const result = valueA.localeCompare(valueB);

        if (sortDirection === 'asc') {
          return result;
        }

        return -result;
      });
    }

    const totalFilteredUsers = displayedUsers.length;
    const totalPages = Math.ceil(totalFilteredUsers / usersPerPage);

    if (totalPages === 0) {
      currentPage = 1;
    }
    else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;

    const paginatedUsers = displayedUsers.slice(startIndex, endIndex);

    const showingStart = startIndex + 1;
    const showingEnd = Math.min(
      startIndex + paginatedUsers.length,
      totalFilteredUsers
    );

    showingCount.textContent = `Showing ${showingStart}-${showingEnd} of ${totalFilteredUsers} users`;

    if (totalFilteredUsers === 0) {
      pagination.style.display = 'none';

      if (users.length === 0) {
        emptyMsg.textContent = 'No users added yet.';
        showingCount.textContent = 'Showing 0-0 of 0 users.';
      }
      else {
        emptyMsg.textContent = 'No users found.';
      }

      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none';

    paginatedUsers.forEach(user => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${user.displayId}</td>
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

    updatePagination(totalFilteredUsers);
  }

  function updateStatistics() {
    const totalUsers = users.length;

    const maleUsers = users.filter(user =>
      user.gender === 'Male'
    ).length;

    const femaleUsers = users.filter(user =>
      user.gender === 'Female'
    ).length;

    totalUsersStat.textContent = totalUsers;
    maleUsersStat.textContent = maleUsers;
    femaleUsersStat.textContent = femaleUsers;
  }

  function updateSortArrows() {
    sortHeaders.forEach(header => {
      const arrow = header.querySelector('.sort-arrow');

      if (header.getAttribute('data-sort') === sortField) {
        if (sortDirection === 'asc') {
          arrow.textContent = '↑';
        }
        else {
          arrow.textContent = '↓';
        }
      }
      else {
        arrow.textContent = '';
      }
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

  function validateInputs() {
    const fnValue = firstName.value.trim();
    const lnValue = lastName.value.trim();
    const genderValue = gender.value;

    let valid = true;

    if (fnValue === '') {
      firstNameError.textContent = 'First Name is required.';
      valid = false;
    }
    else if (fnValue.length < 2) {
      firstNameError.textContent =
        'Minimum 2 characters are required.';
      valid = false;
    }
    else if (/\d/.test(fnValue)) {
      firstNameError.textContent =
        'Name cannot contain numbers.';
      valid = false;
    }
    else {
      firstNameError.textContent = '';
    }

    if (lnValue === '') {
      lastNameError.textContent = 'Last Name is required.';
      valid = false;
    }
    else if (lnValue.length < 2) {
      lastNameError.textContent =
        'Minimum 2 characters are required.';
      valid = false;
    }
    else if (/\d/.test(lnValue)) {
      lastNameError.textContent =
        'Name cannot contain numbers.';
      valid = false;
    }
    else {
      lastNameError.textContent = '';
    }

    if (genderValue === '') {
      genderError.textContent = 'Please select a gender.';
      valid = false;
    }
    else {
      genderError.textContent = '';
    }

    return valid;
  }

  function checkInputs() {
    if (editingIndex !== null) {
      saveBtn.disabled = true;
      return;
    }

    const valid = validateInputs();

    saveBtn.disabled = !valid;
  }

  function normalizeName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function isDuplicateUser(firstNameValue, lastNameValue, currentId = null) {
    const normalizedFirstName = normalizeName(firstNameValue);
    const normalizedLastName = normalizeName(lastNameValue);

    return users.some(user => {
      if (currentId !== null && user.id === currentId) {
        return false;
      }

      return (
        normalizeName(user.firstName) === normalizedFirstName &&
        normalizeName(user.lastName) === normalizedLastName
      );
    });
  }

  function openDeleteConfirmation(id) {
    const user = users.find(user => user.id === id);

    if (!user) {
      return;
    }

    pendingDeleteId = id;

    deleteMessage.textContent =
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`;

    pauseTimer();

    deleteModal.style.display = 'flex';
  }

  function closeDeleteConfirmation() {
    pendingDeleteId = null;
    deleteModal.style.display = 'none';

    if (users.length > 0 && editingIndex === null) {
      resumeTimer();
    }
  }

  function deleteUser() {
    if (pendingDeleteId === null) {
      return;
    }

    const index = users.findIndex(user => user.id === pendingDeleteId);

    if (index === -1) {
      closeDeleteConfirmation();
      return;
    }

    users.splice(index, 1);

    saveUsers();

    if (editingIndex === pendingDeleteId) {
      editingIndex = null;

      form.reset();

      firstNameError.textContent = '';
      lastNameError.textContent = '';
      genderError.textContent = '';
      duplicateError.textContent = '';

      saveBtn.disabled = true;
    }

    closeDeleteConfirmation();

    renderTable();

    if (users.length === 0) {
      resetTimer();
    }
    else if (editingIndex === null && timerInterval === null) {
      resumeTimer();
    }
  }

  function updatePagination(totalUsers) {
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    pageNumbers.innerHTML = '';

    for (let page = 1; page <= totalPages; page++) {
      const button = document.createElement('button');

      button.type = 'button';
      button.textContent = page;
      button.classList.add('page-number');

      if (page === currentPage) {
        button.classList.add('active');
      }

      button.addEventListener('click', () => {
        currentPage = page;
        renderTable();
      });

      pageNumbers.appendChild(button);
    }
  }

  [firstName, lastName, gender].forEach(input => {
    input.addEventListener('input', checkInputs);
    input.addEventListener('change', checkInputs);
  });

  searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderTable();
  });

  sortHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-sort');

      if (sortField === field) {
        if (sortDirection === 'asc') {
          sortDirection = 'desc';
        }
        else {
          sortDirection = 'asc';
        }
      }
      else {
        sortField = field;
        sortDirection = 'asc';
      }

      currentPage = 1;

      updateSortArrows();
      renderTable();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (editingIndex !== null) {
      return;
    }

    if (!validateInputs()) {
      return;
    }

    if (isDuplicateUser(firstName.value, lastName.value)) {
      duplicateError.textContent = 'This user already exists';
      return;
    }

    duplicateError.textContent = '';
    const nextDisplayId = users.length > 0
    ? Math.max(...users.map(user => user.displayId || 0)) + 1
    : 1;

    const newUser = {
      id: crypto.randomUUID(),
      displayId: nextDisplayId,
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
      duplicateError.textContent = '';

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

      if (isDuplicateUser(firstName.value, lastName.value, id)) {
        duplicateError.textContent = 'This user already exists';
        return;
      }

      duplicateError.textContent = '';

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

      openDeleteConfirmation(id);
    }
  });

  genderFilters.forEach(button => {
    button.addEventListener('click', () => {
      selectedGender = button.getAttribute('data-gender');

      genderFilters.forEach(filter => {
        filter.classList.remove('active');
      });

      button.classList.add('active');

      currentPage = 1;

      renderTable();
    });
  });

  cancelDeleteBtn.addEventListener('click', () => {
    closeDeleteConfirmation();
  });

  confirmDeleteBtn.addEventListener('click', () => {
    deleteUser();
  });

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const searchValue = searchInput.value.trim().toLowerCase();

    let filteredUsers = [...users];

    if (searchValue !== '') {
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchValue) ||
        user.lastName.toLowerCase().includes(searchValue)
      );
    }

    if (selectedGender !== 'all') {
      filteredUsers = filteredUsers.filter(user =>
        user.gender === selectedGender
      );
    }

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  loadUsers();

  if (users.length > 0) {
    startTimer();
  }
});