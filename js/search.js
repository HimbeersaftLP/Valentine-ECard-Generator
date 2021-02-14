(function() {
    "use strict";
    const imageSearchBtn = document.getElementById("imageSearch");
    const imageSearchWin = document.getElementById("imageSearchWin");
    const searchForm = document.getElementById("searchForm");
    const searchText = document.getElementById("searchText");
    const searchResultList = document.getElementById("searchResults");
    const searchNavBackBtn = document.getElementById("searchNavBack");
    const searchNavForwardBtn = document.getElementById("searchNavForward");
    const searchPageInfo = document.getElementById("searchPageInfo");

    imageSearchBtn.addEventListener("click", function () {
        openWindow(imageSearchWin);
    });

    let currentPage = 1;
    let currentSearchTerm = "";

    function doSearch() {
        while (searchResultList.firstChild) {
            searchResultList.removeChild(searchResultList.firstChild);
        }

        imageSearchWin.className = "window searchLoading";
        searchNavBackBtn.style.display = searchNavForwardBtn.style.display = "";

        const formData = new FormData();
        formData.append("q", currentSearchTerm);
        formData.append("p", currentPage);
        var request = new XMLHttpRequest();
        request.addEventListener("load", function() {
            imageSearchWin.className = "window";
            const text = request.responseText;
            if (text.length === 0) return;
            const data = JSON.parse(text);
            for (let i = 0; i < data.hits.length; i++) {
                const entry = data.hits[i];
                addImageOption(searchResultList, entry.tags + " by " + entry.user, entry.webformatURL, entry.pageURL);
            }
            if (data.totalHits > 20) {
                imageSearchWin.className = "window searchNavigation";
                searchPageInfo.innerText = "Page " + currentPage + "; " + data.totalHits + " images available.";
            }
            if (currentPage === 1) {
                searchNavBackBtn.style.display = "none";
            }
            if (data.hits.length < 20) {
                searchNavForwardBtn.style.display = "none";
            }
        });
        request.open("POST", "search.php");
        request.send(formData);
    }

    searchForm.addEventListener("submit", function(e) {
        e.preventDefault();
        searchText.value = searchText.value.replace("/[^a-z0-9 ]+/ig", "");
        currentPage = 1;
        currentSearchTerm = searchText.value;
        doSearch();
    });

    searchNavBackBtn.addEventListener("click", function() {
        currentPage--;
        doSearch();
    });

    searchNavForwardBtn.addEventListener("click", function() {
        currentPage++;
        doSearch();
    });

    searchResultList.addEventListener("click", function (e) {
        let p = e.target;
        while (p.className !== "pickerElement") {
            p = p.parentElement;
        }
        closeWindow(imageSearchWin);
        createCropperFor(p.getAttribute("data-image-url"));
    });
})();