(function() {
    let $ = document.querySelector.bind(document);
    let $dom = {};

    $dom.navbarLinks = $('[js-navbar-links]');
    $dom.navbarToggle = $('[js-navbar-toggle]');

    // Toggles the state of the mobile navbar
    let navbarToggle = () => {
      if($dom.navbarLinks.classList.contains('is-shown')){
            $dom.navbarLinks.classList.remove('is-shown')
      }else{
        $dom.navbarLinks.classList.add('is-shown')
      }
    };

    window.addEventListener('DOMContentLoaded', () => {
        $dom.navbarToggle.addEventListener('click', navbarToggle);
    });
})();