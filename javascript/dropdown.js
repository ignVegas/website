document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.querySelector('.hamburger input');
    const dropdownOverlay = document.getElementById('dropdownOverlay');
    const logoLink = document.getElementById('logoLink');
    const menuStyle = document.querySelector('.menu-style');

    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            logoLink.classList.add('logo-link-expanded');
            dropdownOverlay.classList.add('active');
            menuStyle.classList.add('active');
        } else {
            logoLink.classList.remove('logo-link-expanded');
            dropdownOverlay.classList.remove('active');
            menuStyle.classList.remove('active');
        }
    });
});
