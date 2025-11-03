import { change_type } from '@repo/db';

console.log('change_type.UPDATE:', change_type.UPDATE);
console.log('Type:', typeof change_type.UPDATE);
console.log('All values:', Object.keys(change_type).map(k => `${k}: ${change_type[k as keyof typeof change_type]}`));
