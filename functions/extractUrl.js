const checkURL = function (item) {
  const caption = item.caption;
  caption.split(' ').forEach((part) => {
    const regexWithoutHttp = /[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&//=]*)/;
    const regexWithHttp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&//=]*)/;

    if (part.match(regexWithoutHttp) || part.match(regexWithHttp)) {
      part = part.split(/[\r\n]+/gm);
      item.url = part[0];
    }
  });
};

module.exports = checkURL;
