module.exports = function (obj, arr) {
  var sum = 0;
  var occurrences;
  for(var i = 0; i < arr.length; i++) {
    occurrences = obj[arr[i]];
    if(occurrences) {
      sum += occurrences;
    }
  }
  return sum;
}
