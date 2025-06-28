const give_response = function (res, status_code, success, message, data = null) {
  data = data == null ? {} : data;
  return res.status(status_code).json({ success, message, data });
};

export default give_response;