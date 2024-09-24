/*
 *  regular expressions to recognize time representations
 */

export const norm =
  /^(?:(?:(?:(?:(?:(\d{4})-)?(\d{1,2})-)?(\d{1,2})\D)?(\d{1,2}):)?(\d{1,2}):)?(\d{1,2})$/;
export const week = /^[a-z]+\s(\d{1,2}:\d{1,2}:\d{1,2})$/i;

// end of fmt.js
