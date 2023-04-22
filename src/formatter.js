const paragraph = document.getElementById("profile-description");
const regex = /[#@]\w+/g;
const matches = paragraph.textContent.match(regex);
matches.forEach(match => {
  paragraph.innerHTML = paragraph.innerHTML.replace(match, `<span style="color: blue; cursor: Pointer;">${match}</span>`);
});