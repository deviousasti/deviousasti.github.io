
document.addEventListener("load", function(){
      var elems = document.querySelectorAll("table");
      Array.from(elems).forEach(function(elem){
        elem.classList.add('table-striped', 'table', 'table-responsive', 'table-hover');
      });
});