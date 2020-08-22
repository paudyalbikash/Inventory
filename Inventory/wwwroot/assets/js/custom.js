function getChildItems(arr = [], data = []) {
    if (arr.length === 0)
        return null;
    else {
        let htm = '';
        arr.forEach(y => {
            let row = Enumerable.from(data).where(x => x.Id === y).firstOrDefault();
            if (row) {
                htm += "<span class='badge'>" + row.Name + "</span>";
            }
        });
        return htm;
    }
}



function imgError(image) {
    image.onerror = "";
    if ($(image).hasClass("user-img-alt")) {
        $(image).attr("src", dataHelper.avatarUrl);
    }
}
