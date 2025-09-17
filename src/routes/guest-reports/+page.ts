import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  return {
    title: 'Your Reports',
    description: 'View your cached JobPostScore reports and analyses.'
  };
};
