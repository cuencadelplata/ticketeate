const baseButtonStyles =
  'px-4 py-2 rounded-md text-sm font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-gray-600';
const darkButtonStyles = 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700';
const inputStyles =
  'w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-md text-gray-200 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-500';

export const styles = {
  button: `${baseButtonStyles} ${darkButtonStyles}`,
  input: inputStyles,
  textarea: inputStyles,
  select: inputStyles,
};
