function validate() {
  let email = document.getElementById("email-input").value
  let password = document.getElementById("password-input").value

  if (email.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/)) {
    document.getElementById("email-input").className = ""
    document.getElementById("ewarn").style.display = "none"
    if (password.length > 8) {
      document.getElementById("password-input").className = ""
      document.getElementById("pwarn").style.display = "none"
      return true
    } else {
      document.getElementById("password-input").className = "incorrect"
      document.getElementById("pwarn").textContent = "Password invalid"
      document.getElementById("pwarn").style.display = "block"
    }
    return false
  } else {
    document.getElementById("email-input").className = "incorrect"
    document.getElementById("ewarn").textContent = "Email invalid"
    document.getElementById("ewarn").style.display = "block"
    if (password.length > 8) {
      document.getElementById("password-input").className = ""
      document.getElementById("pwarn").style.display = "none"
      return true
    } else {
      document.getElementById("password-input").className = "incorrect"
      document.getElementById("pwarn").textContent = "Password invalid"
      document.getElementById("pwarn").style.display = "block"
    }
    return false
  }
}


function nextPage() {
  if (validate()) {
    window.open('mindi.html')
  }
}