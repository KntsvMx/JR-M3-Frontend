

// variables
let accountsCount = 0;
let accountPerPage = 3;
let pageAmount = 0;
let currentPageNumber = 0;
const defaultValueForDropDownList = 3;
//arrays
const optionsForDropDownList = [3, 5, 10, 20];
const optionForBanned = [true, false];
const optionForRace = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const optionForProfession = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];


updateAccountsCount().then((count) => {
    accountsCount = count;
    fillTable(currentPageNumber, accountPerPage);
    createSelectOption(optionsForDropDownList, '#account-per-page', defaultValueForDropDownList);
    createPaginationButtons();
    createSelectOption(optionForRace, "#race");
    createSelectOption(optionForProfession, "#profession");
    createSelectOption(optionForBanned, "#banned", "false");
});

// Listening all of events
$(document).on('click', '.pagination-buttons button, .edit-button, .delete-button, .create-account-button', function (event) {
    if ($(this).hasClass('pagination-buttons')) {
        currentPageNumber = $(this).val();
        actionWithPaginationButtons()
        fillTable(currentPageNumber, accountPerPage);
    } else if ($(this).hasClass('edit-button')) {
        let id = $(this).val();
        actionWithEditButton(id);
    } else if ($(this).hasClass('delete-button')) {
        let id = $(this).val();
        actionWithDeleteButton(id);
    } else if ($(this).hasClass('create-account-button')) {
        event.preventDefault();
        console.log("Button clicked");
        actionWithCreateAccount();
    }
})
$(document).on('change', '#account-per-page', actionWithDropDownList);


function updateAccountsCount() {
    return new Promise((resolve, reject) => {
        $.get('/rest/players/count', (count) => {
            resolve(count);
        }).fail((error) => {
            reject(error);
        });
    });
}

function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (accounts) => {
        const $tableBody = $('.account-table-body');

        $tableBody.empty();

        $.each(accounts, (index, account) => {
            $tableBody.append(createTableRows(account));
        })
    })
}

function createTableRows(account) {
    const dateOfBirthday = new Date(account.birthday).toLocaleDateString();

    return `<tr class="account-table__row account-table__row_body">
                <td class="account_cell" account-id>${account.id}</td>
                <td class="account_cell" account-name>${account.name}</td>
                <td class="account_cell" account-title>${account.title}</td>
                <td class="account_cell" account-race>${account.race}</td>
                <td class="account_cell" account-profession>${account.profession}</td>
                <td class="account_cell" account-level>${account.level}</td>
                <td class="account_cell" account-birthday>${dateOfBirthday}</td>
                <td class="account_cell" account-banned>${account.banned}</td>
                <td class="account_cell cell-edit">
                    <button class="edit-button" value="${account.id}">
                        <img src="/img/edit.png" alt="edit">
                    </button>
                </td>
                <td class="account_cell cell-delete">
                    <button class="delete-button" value="${account.id}">
                        <img src="/img/delete.png" alt="delete">
                    </button>
                </td>
            </tr>`;
}

function createSelect(idName, defaultValue) {
    const $select = document.createElement('select');
    $select.setAttribute('id', idName);
    $select.setAttribute('data-value', defaultValue);

    $select.addEventListener('change', e => {
        $select.setAttribute('data-value', e.currentTarget.value);
    });
    return $select;
}

function createSelectOption(optionArray, element, defaultValue) {
    const $options = $(element);

    $options.append(createSelectOptionForHTML(optionArray, defaultValue));
}

function createSelectOptionForHTML(optionArray, defaultValue) {
    let optionalHtml = '';
    optionArray.forEach(option => {
        const optionValue = typeof option === "boolean" ? option.toString() : option;
        optionalHtml += `<option ${defaultValue === optionValue && 'selected'} value="${option}"> ${option}</option>`;
    })
    return optionalHtml;
}

function createPaginationButtons() {
    pageAmount = accountsCount ? Math.ceil(accountsCount / accountPerPage) : 0;
    const $buttons = $('.pagination-buttons');
    let paginationButtons = '';

    for (let i = 1; i < pageAmount; i++) {
        paginationButtons += `<button value="${i - 1}">${i}</button>`;
    }

    $buttons.append(paginationButtons);
    changeActivePageButton(currentPageNumber);
    $buttons.find('button').on('click', actionWithPaginationButtons);
}

function createInput(value) {
    const $inputElementHTML = document.createElement('input');

    $inputElementHTML.setAttribute('type', 'value');
    $inputElementHTML.setAttribute('value', value);
    $inputElementHTML.setAttribute('date-value', value);

    $inputElementHTML.addEventListener('input', event => {
        $inputElementHTML.setAttribute('data-value', event.currentTarget.value);
    })

    return $inputElementHTML;
}

// Handle all of Events
function changeActivePageButton(currentPageNumber) {
    const $buttons = $('.pagination-buttons button');

    $buttons.removeClass('active-page');
    $buttons.filter(`[value="${currentPageNumber}"]`).addClass('active-page');
}

function actionWithPaginationButtons() {
    currentPageNumber = $(this).val();
    changeActivePageButton(currentPageNumber);
    fillTable(currentPageNumber, accountPerPage);
}

function actionWithDropDownList() {
    accountPerPage = $(this).val();
    const maxOfAccountPerPage = 20;

    if (accountPerPage === maxOfAccountPerPage) {
        currentPageNumber = 0;
    }

    fillTable(currentPageNumber, accountPerPage);

    $('.pagination-buttons').empty();
    createPaginationButtons();
}

function actionWithEditButton(id) {
    const $currentRow = $(`.edit-button[value="${id}"]`).closest('.account-table__row');
    const $deleteButton = $currentRow.find('.delete-button');
    const $editButton = $currentRow.find('.edit-button img');

    const $currentAccountName = $currentRow.find('[account-name]');
    const $currentAccountTitle = $currentRow.find('[account-title]');
    const $currentAccountRace = $currentRow.find('[account-race]');
    const $currentAccountProfession = $currentRow.find('[account-profession]');
    const $currentAccountBanned = $currentRow.find('[account-banned]');

    $deleteButton.hide();
    $editButton.attr('src', '/img/save.png');

    $currentAccountName.contents().first().replaceWith(createInput($currentAccountName.text()));
    $currentAccountTitle.contents().first().replaceWith(createInput($currentAccountTitle.text()));

    const raceValue = $currentAccountRace.text();
    $currentAccountRace.contents().first().replaceWith(createSelect('account-name', raceValue));
    createSelectOption(optionForRace, '#account-name', raceValue);

    const professionValue = $currentAccountProfession.text()
    $currentAccountProfession.contents().first().replaceWith(createSelect('account-profession', professionValue));
    createSelectOption(optionForProfession, '#account-profession', professionValue);

    const bannedValue = $currentAccountBanned.text().toLowerCase();
    $currentAccountBanned.contents().first().replaceWith(createSelect('account-banned', bannedValue));
    createSelectOption(optionForBanned, '#account-banned', bannedValue);

    $editButton.on('click', function () {
        const updateData = {
            accountId: id,
            data: {
                name: $currentAccountName.find('input').data('value'),
                title: $currentAccountTitle.find('input').data('value'),
                race: $currentAccountRace.find('select').val(),
                profession: $currentAccountProfession.find('select').val(),
                birthday: $currentRow.find('account-birthday').val(),
                banned: $currentAccountBanned.find('select').val(),
                level: $currentRow.find('account-level').val()
            }
        };
        actionWithSaveNewData(updateData);
    });
}

function actionWithSaveNewData({accountId, data}) {
    $.ajax({
        url: `/rest/players/${accountId}`,
        type: `POST`,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(data),
        success: function (result) {
            updateAccountsCount().then(count => {
                accountsCount = count;
                fillTable(currentPageNumber, accountPerPage);
            })
        },
        error: function (error) {
            console.error('Error deleting account: ', error);
        }
    });
}

function actionWithDeleteButton(id) {
    $.ajax({
        url: `/rest/players/${id}`,
        type: `DELETE`,
        success: function (result) {
            updateAccountsCount().then(count => {
                accountsCount = count;
                fillTable(currentPageNumber, accountPerPage);
            })
        },
        error: function (error) {
            console.error('Error deleting account: ', error);
        }
    });
}

function actionWithCreateAccount() {
    const createData = {
        data: {
            name: $('[data-create-name]').val(),
            title: $('[data-create-title]').val(),
            race: $('[data-create-race]').val(),
            profession: $('[data-create-profession]').val(),
            birthday: new Date($('[data-create-birthday]').val()).getTime(),
            banned: $('[data-create-banned]').val(),
            level: $('[data-create-level]').val()
        }
    };
    createNewAccount(createData);
}

function createNewAccount({data}) {
    $.ajax({
        url: `/rest/players`,
        type: `POST`,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(data),
        success: function (result) {
            updateAccountsCount().then(count => {
                accountsCount = count;
                fillTable(currentPageNumber, accountPerPage);
            })
        },
        error: function (error) {
            console.error('Error deleting account: ', error);
        }
    });
}

