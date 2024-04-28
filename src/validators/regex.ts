const password = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/);
const email = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
const phone = new RegExp(/^([+\d].*)?\d$/);
const number = new RegExp(/^[0-9]+$/);
const username = new RegExp(/^[a-zA-Z0-9!@#$%^&*)(]{2,20}$/);
const name = new RegExp(/[a-zA-Z]+/);
const address = new RegExp(/^[#.0-9a-zA-Z\s,-]+$/);

const regex = {
  password,
  email,
  phone,
  number,
  username,
  name,
  address,
};

export default regex;
