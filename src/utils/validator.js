const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter strong password");
  }
};

const validateEditFieldsData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "skills",
    "about",
    "photoUrl",
    "age",
    "gender",
  ];

  const isEditAllowed = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key),
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditFieldsData,
};
