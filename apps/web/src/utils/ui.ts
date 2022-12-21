//For calculating the theme color
export const textToColorScheme = (text: string) => {
  if (!text) return "blue";

  //A- G is red
  if (text[0].toLowerCase() >= "a" && text[0].toLowerCase() <= "g") {
    return "blue";
  }
  //H - N is orange
  if (text[0].toLowerCase() >= "h" && text[0].toLowerCase() <= "n") {
    return "orange";
  }
  //O - S is yellow
  if (text[0].toLowerCase() >= "o" && text[0].toLowerCase() <= "s") {
    return "red";
  }
  //T - Z is green
  if (text[0].toLowerCase() >= "t" && text[0].toLowerCase() <= "z") {
    return "green";
  }

  return "violet";
};
//Get user initial for username
export const getInitial = (name: string) => {
  const chi = new RegExp("^[\u4E00-\uFA29]*$"); //Chinese character range
  const eng = new RegExp("^[\uE7C7-\uE7F3]*$"); //non Chinese character range
  let first = "";
  let last = "";
  name = name.trim().toUpperCase();
  if (!chi.test(name) || eng.test(name)) {
    if ((name.match(/ /g) || []).length === 1) {
      first = name.slice(0, 1);
      last = name.slice(name.indexOf(" ") + 1, name.indexOf(" ") + 2);
      return first + last;
    }
    if ((name.match(/ /g) || []).length > 1) {
      first = name.slice(0, 1);
      last = name.slice(name.lastIndexOf(" ") + 1, name.lastIndexOf(" ") + 2);
      return first + last;
    }
    if (name.length > 1) {
      first = name.slice(0, 1);
      last = name.slice(name.length - 1, name.length);
      return first + last;
    }
    return name;
  }
  return name.replace(/\s/g, "").slice(name.length - 2, name.length);
};

export const escapeSearchTerm = (searchTerm: string) => {
  return searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").trim() || "";
};
