function isEmpty(value) {
  return !value || value.trim() === "";
}

function userCredentialsAreValid(username, password) {
  return username && password && password.trim().length >= 6;
}

function userDetailsAreValid(username, password, name, street, postal, city) {
  return (
    userCredentialsAreValid(username, password) &&
    !isEmpty(name) &&
    !isEmpty(street) &&
    !isEmpty(postal) &&
    !isEmpty(city)
  );
}

function passwordIsConfirmed(password, confirmPassword) {
  return password === confirmPassword;
}

module.exports = {
  userDetailsAreValid: userDetailsAreValid,
  passwordIsConfirmed: passwordIsConfirmed,
};
