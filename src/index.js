import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/scrollspy';

require('./style/main.scss');


function isScrolledIntoView(elem){
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  var elemBottom = elemTop + $elem.height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


function scale(num, in_min, in_max, out_min, out_max) {
  if(num < in_min) num = in_min;
  if(num > in_max) num = in_max;

  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function toggleLogos() {

  let headerBrand = $("header h1")
  let navBrand = $(".navbar-brand")

  let scrollTop = $(window).scrollTop();
  let vh = $(window).height();

  //if(scrollTop > vh) {
  //} 

  if( headerBrand.css("display") === "none" ) {
      navBrand.css('opacity', 1)
  } else {

      var elTop = headerBrand.offset().top;
      var elHeight = headerBrand.height()
      var elBottom = elTop + headerBrand.height();

      //console.log(elTop, scrollTop) 
      navBrand.css('opacity', scale(elBottom - scrollTop, 0, elHeight, 1, 0));

  }

  navBrand.css('transition', "opacity 0.2s ease-in-out");

}


$( document ).ready(function() {

  toggleLogos();

  $(window).scroll(function(){
    toggleLogos();
  });

  $(window).resize(function(){
    toggleLogos();
  });


});