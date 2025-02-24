function loadSearchSidebar(){

    let out = `
                <div class="sidebar-content-top">
                    <div class="sidebar-subtitle span-up text-bold">Search:</div>
                    <div class="sidebar-row">
                        <input class="in-searchbox enter-exec" type="text" placeholder="Search" id="fld_search">
                    </div>
                    <div class="sidebar-subtitle span-up text-bold">Filters:</div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Database: </div>
                        <div class="cb-search"><input type="checkbox" id="fld_bio" value="biorxiv"> biorxiv</div>
                        <div class="cb-search"><input type="checkbox" id="fld_med" value="medrxiv"> medrxiv</div>
                    </div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Date: </div>
                        <div class="sidebar-tbl-dates">
                            <table class="table-dates">
                                <tr>
                                    <td><div class="date-label">Start</div></td><td><div class="date-label">End</div></td>
                                </tr>
                                <tr>
                                    <td id="padd-right"><input class="in-date" type="date" id="fld_date_start"></td><td><input class="in-date" type="date" id="fld_date_end"></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Category: </div>
                        <div class="input-box">
                            <select name="categories" id="fld_category" id="fld_category">
                            </select>
                        </div>
                    </div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Author: </div>
                        <div class="input-box enter-exec"><input type="text" id="fld_author"></div>
                    </div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Title: </div>
                        <div class="input-box enter-exec"><input type="text" id="fld_title"></div>
                    </div>
                    <div class="sidebar-row">
                        <div class="sidebar-item">Abstract: </div>
                        <div class="input-box enter-exec"><input type="text" id="fld_abstract"></div>
                    </div>
                    <div class="sidebar-row content-align-right">
                        <div class="submit-btn" id="btn-advclear">Clear</div>
                        <div class="submit-btn" id="btn-advsearch" onclick="javascript:runAdvancedSearch()">Search</div>
                    </div>
                </div>
                <form action="javascript:showArticleDoi()">
                    <div class="sidebar-content-bottom">
                        <div class="search-doi-title">Search by Article Code:</div>
                        <div class="search-doi">
                            <div class="search-doi-title right20">DOI: </div>
                            <div class="search-doi-in"><input type="text" placeholder="10.1101/..." id="fld_doi"></div>
                        </div>
                        <div class="content-align-right">
                            <div class="submit-btn" id="doi-submit" onclick="javascript:showArticleDoi()">Search</div>
                        </div>
                    </div>
                </form>
    `
    return out;
}


function loadTreeSidebar(){
    let out = `
                <div class="container-tree">
                    <div class="tree-favorite draggable container filedropbox" id="tree-favorite">
                        <div class="favorite-label">Favorites</div>
                        <div class="favorite-btns">
                            <div class="btn-ops-favorites">+</div>
                        </div>
                    </div>
                    <div class="tree">
                        <ul id="tree-content">
                            
                        </ul>
                    </div>
                </div>
    `
    return out;
}

export {loadSearchSidebar,loadTreeSidebar};