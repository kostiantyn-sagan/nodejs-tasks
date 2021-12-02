const validateFilterObj = (filter) => {
  const fields = [
    "name",
    "first",
    "last",
    "phone",
    "address",
    "zip",
    "city",
    "country",
    "street",
    "email",
  ];

  if (filter.address && typeof filter.address !== "object") {
    throw new Error("filter.address should an object");
  }

  if (filter.name && typeof filter.name !== "object") {
    throw new Error("filter.name should an object");
  }

  if (filter.address && Array.isArray(filter.address)) {
    throw new Error("filter.address should an object but received an array");
  }

  if (filter.name && Array.isArray(filter.name)) {
    throw new Error("filter.name should an object but received an array");
  }

  if (filter.address && !Object.keys(filter.address).length) {
    throw new Error("filter.address should contain at least one property");
  }

  if (filter.name && !Object.keys(filter.name).length) {
    throw new Error("filter.name should contain at least one property");
  }

  for (const key in filter) {
    if (filter.hasOwnProperty(key) && typeof filter[key] !== "object") {
      const isExists = fields.some((item) => item === key);

      if (!isExists) {
        throw new Error(`${key} is not allowed field for filter object`);
      }

      if (typeof filter[key] !== "string") {
        throw new Error(`${key} field should be a string`);
      }
    } else if (filter.hasOwnProperty(key) && typeof filter[key] === "object") {
      validateFilterObj(filter[key]);
    }
  }
};

const _filterUser = ({ user, filter }) => {
  let validations = [];
  const { name, addres, phone, email } = filter;
  const {
    name: userName,
    address: userAddress,
    phone: userPhone,
    email: userEmail,
  } = user;

  if (name && userName && name.first && userName.first) {
    const valid = new RegExp(name.first, "gi").test(userName.first);
    validations.push(valid);
  }

  if (name && userName && name.last && userName.last) {
    const valid = new RegExp(name.last, "gi").test(userName.last);
    validations.push(valid);
  }

  if (phone && userPhone) {
    const valid = new RegExp(phone, "gi").test(userPhone);
    validations.push(valid);
  }

  if (address && userAddress && address.zip && userAddress.zip) {
    const valid = new RegExp(address.zip, "gi").test(userAddress.zip);
    validations.push(valid);
  }

  if (address && userAddress && address.city && userAddress.city) {
    const valid = new RegExp(address.city, "gi").test(userAddress.city);
    validations.push(valid);
  }

  if (address && userAddress && address.country && userAddress.country) {
    const valid = new RegExp(address.country, "gi").test(userAddress.country);
    validations.push(valid);
  }

  if (address && userAddress && address.street && userAddress.street) {
    const valid = new RegExp(address.street, "gi").test(userAddress.street);
    validations.push(valid);
  }

  if (email && userEmail) {
    const valid = new RegExp(email, "gi").test(userEmail);
    validations.push(valid);
  }

  return validations.every((item) => item);
};

const filterData = ({ data, filter }) => {
  if (!Array.isArray(data)) {
    throw new Error("data should be an array");
  }

  const filteredData = data.filter((user) => _filterUser({ user, filter }));

  return filteredData;
};

module.exports = { validateFilterObj, filterData };
