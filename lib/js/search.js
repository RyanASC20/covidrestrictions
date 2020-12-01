function autocomplete(inp, arr) {

    var currentFocus;
    const MAX_SUGGESTIONS = 12;
    inp.addEventListener("input", function(e) {

        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        let count = 0;
        for (i = 0; i < arr.length; i++) {

          if (arr[i].toLowerCase().indexOf(val.toLowerCase()) != -1) {
            if (count == MAX_SUGGESTIONS) {
                break;
            }
            count++;
            b = document.createElement("DIV");

            b.textContent += arr[i];

            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
                $('#search-form').submit();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { //up
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (inp.value != '') {
                closeAllLists();
                $('#search-form').submit();
            }
        } 
    });
    
    inp.addEventListener('click', () => {
        hideAbout();
        hideInfo();
    });

    function addActive(x) {

        if (!x) return false;

        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);

        x[currentFocus].classList.add("autocomplete-active");
        inp.value = x[currentFocus].textContent;
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {

        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}


const handleSearch = (covidData, guidelineData) => {
    const search_input = $('.search')[0];
    $('#search-form').submit(e => {
        e.preventDefault();
        let c = allCounties[search_input.value.toUpperCase()];
        let selection = covidData[0][c];
        if (selection) {
            let stateGuidelines = guidelineData.filter(e => e.state == selection.state);
            info(selection, covidData, stateGuidelines);
        } else {
            alert('County not found. Please enter in form "county, state"');
        }
        search_input.value = '';

    });
}


autocomplete($('.search')[0], Object.keys(allCounties));