function htmlMain(){
    let out= `
        <div class="container-top">Main</div>
        <div class="main-container">
            <div class="btns-container">
                <div class="admin-btn" onclick="javascript:getUsersHtml()">Users</div>
                <!--<div class="admin-btn" onclick="javascript:getStatisticsHtml()">Statistics</div>-->
                <div class="admin-btn" onclick="javascript:getFaqHtml()">FAQ Actualizer</div>
            </div>
        </div>
    `

    return out;
}

function htmlUsers(){
    let out = `
        <div class="container-top">Users</div>
        <div class="users-container">
            <div class="search-users">
                <input type="text" placeholder="Search User..." id="searchemail" onKeyPress="filterUsers()" onKeyUp="filterUsers()">
            </div>
            <div class="user-table-container">
                <table class="user-table" id="usertable">
                    <tr>
                        <th>ID</th>
                        <th>Name</th> 
                        <th>Email</th>
                        <th>Registration</th>
                        <th>Role</th>
                        <th>Valid</th>
                        <div class="delete-user">
                            <th></th><th></th></div>
                    </tr>
                    <tr>
                        <td>01</td>
                        <td>Sandra</td>
                        <td>spatricia.lourenco@gmail.com</td>
                        <td>10/07/2021</td>
                        <td>Role-User</td>
                        <td>false</td>
                        <td class="user-delete-btn-td"><div class="user-delete-btn"><img src="../admin_icons/delete.png" alt=""></div></td>
                        <td class="user-delete-btn-td"><div class="user-role-btn"><img src="../admin_icons/toggle_on.png" alt=""></div></td>
                    </tr>
                </table>
            </div>
        </div>
    `

    return out;
}

function htmlStatistics(){
    let out = `
        <div class="container-top">Statistics</div>
    `

    return out;
}

function htmlFaq(){
    let out = `
        <div class="container-top">FAQ's</div>
        <div class="faq-container" id="faq-container">
            <div class="faq-table-container">
                <table class="faq-table" id="faqtable"></table>
            </div>
            <div class="page-spacer">&nbsp</div>
            <div class="faq-edit-container">
                <div class="faq-edit">
                    <table class="faq-edit-table">
                        <tr>
                            <th class="faq-col-id faq-th">ID</th>
                            <th class="faq-col-q faq-th">Question</th>
                            <th class="faq-col-a faq-th">Answer</th>
                        </tr>
                        <tr>
                            <td class="faq-col-id"><div><textarea id="txtid" name=""></textarea></div></td>
                            <td class="faq-col-q"><div><textarea id="txtq" name=""></textarea></div></td>
                            <td class="faq-col-a"><div><textarea id="txta" name=""></textarea></div></td>
                        </tr>
                    </table>
                </div>
                <div class="faq-edit-btn">
                    <button class="edit-btn" onclick="faqSave()"><img src="./admin_icons/save.png" alt=""></button>
                    <button class="edit-btn" onclick="faqDelete()"><img src="./admin_icons/delete.png" alt=""></button>
                </div>
            </div>
        </div>
    `
    return out;
}


export {htmlMain,htmlUsers,htmlStatistics,htmlFaq}