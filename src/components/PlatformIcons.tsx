import { BsSlack, BsMicrosoftTeams } from 'react-icons/bs';
import { SiNotion, SiGithub, SiDiscord } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

// Official, crisp brand logos with accessible vector typography
export const PlatformIcons = {
  Teams: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <BsMicrosoftTeams
        className={`${className} ${hasColor ? '' : 'text-[#505AC9]'} shrink-0`}
      />
    );
  },
  Slack: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <BsSlack
        className={`${className} ${hasColor ? '' : 'text-[#ECB22E]'} shrink-0`}
      />
    );
  },
  Notion: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiNotion
        className={`${className} ${hasColor ? '' : 'text-white'} shrink-0`}
      />
    );
  },
  GitHub: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiGithub
        className={`${className} ${hasColor ? '' : 'text-white'} shrink-0`}
      />
    );
  },
  Discord: ({ className = 'w-6 h-6' }: { className?: string } = {}) => {
    const hasColor = /text-/.test(className);
    return (
      <SiDiscord
        className={`${className} ${hasColor ? '' : 'text-[#5865F2]'} shrink-0`}
      />
    );
  },
  Google: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <FcGoogle className={`${className} shrink-0`} />
  ),
  Composio: ({ className = 'w-6 h-6' }: { className?: string } = {}) => (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} fill="none">
      <rect width="32" height="32" rx="8" fill="#1b1c1e" />
      <path
        d="M16 6L24.66 11V21L16 26L7.34 21V11L16 6Z"
        stroke="#ff6363"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.5" fill="#ff6363" />
      <path d="M16 9.5V12.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 19.5V22.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 13L13 14.5" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 17.5L21.5 19" stroke="#ff6363" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};
