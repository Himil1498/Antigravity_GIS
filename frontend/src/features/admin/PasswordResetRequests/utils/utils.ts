export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
};

export const generateRandomPassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

