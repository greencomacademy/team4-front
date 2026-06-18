export const email = (val) => {
  const regex = /^[0-9a-zA-Z](?!.*?[\-\_\.]{2})[a-zA-Z0-9\-\_\.]{3,63}@[0-9a-zA-Z](?!.*?[\-\_\.]{2})[a-zA-Z0-9\-\_\.]{3,63}\.[a-zA-Z]{2,3}$/

  if(!val) {
    return '이메일은 필수입니다.';
  }

  if(!regex.test(val)) {
    return '이메일 양식이 올바르지 않습니다.';
  }

  return '';
}

export const password = (val) => {
  const regex = /^[0-9a-zA-Z!@#$%^&*()]{8,20}$/;

  if(!val) {
    return '비밀번호는 필수입니다.';
  }

  if(!regex.test(val)) {
    return '비밀번호 양식이 올바르지 않습니다.\n영어 대소문자, 숫자, 특수문자(!, @, #, $, %, ^, &, *) 허용';
  }

  return '';
}

export const passwordChk = (password, passwordChk) => {
  if(!passwordChk)  {
    return '비밀번호 확인은 필수 입니다.';
  }

   return password === passwordChk ? '' : '비밀번호와 비밀번호 확인이 일치하지 않습니다';
   
}

export const nick = (val) => {
  const regex = /^[0-9a-zA-Z_]{2,20}$/;

  if(!val) {
    return '닉네임은 필수입니다';
  }

  if(!regex.test(val)) {
    return '닉네임 양식이 올바르지 않습니다.\n영어 대소문자, 숫자, 특수문자(_) 허용';
  }

  return '';
}

export const profile = (val) => {
  if(!val) {
    return '프로필은 필수입니다.';
  }

  return '';
}
