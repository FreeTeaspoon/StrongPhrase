import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateIdentities, disposableEmailProviders } from './IdentityUtils';
import PageToolbar from '../components/PageToolbar';
import { 
  FaRegCopy, FaCheck, FaChevronRight, FaInfoCircle, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, 
  FaAt, FaShieldAlt
 } from "react-icons/fa";
import { Si1Password } from "react-icons/si";
import { cn } from '../components/utils';
import { avatarProviders } from './AvatarUtils';
import ToolbarStorage from '../components/storage';
import AvatarDownloadOverlay, { useAvatarDownload } from './AvatarDownload';
import OnePasswordSaveButton from './OnePasswordSaveButton';
import IdentityFAQ from './IdentityFAQ';

// Custom styles for left-aligned tooltips
const tooltipStyles = `
  .tooltip-left-align:before {
    transform: translateX(0) !important;
    left: 0 !important;
  }
  .tooltip-left-align:after {
    transform: translateX(0) !important;
    left: 1rem !important;
  }
`;

const IdentityCard = ({ identity, onCopy, copiedField }) => {
  const { name, phone, address, avatar, gradient, id, birthday, username, disposableEmail, passphrase } = identity;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef(null);
  
  const { downloadStatus, handleImageDownload } = useAvatarDownload(avatar, name);

  // Inject custom tooltip styles
  useEffect(() => {
    // Check if the style element already exists
    const existingStyle = document.getElementById('tooltip-custom-styles');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'tooltip-custom-styles';
      styleElement.innerHTML = tooltipStyles;
      document.head.appendChild(styleElement);
      
      // Clean up on unmount
      return () => {
        const styleToRemove = document.getElementById('tooltip-custom-styles');
        if (styleToRemove) {
          document.head.removeChild(styleToRemove);
        }
      };
    }
  }, []);

  // Create a reusable copy button component
  const CopyButton = ({ text, type, white = false, className = "", icon = <FaRegCopy />, size = "small", tooltip = null, tooltipPosition = "bottom" }) => {
    const iconSize = size === "small" ? "w-3.5 h-3.5" : "w-5 h-5";
    
    return (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onCopy(text, type, id);
        }}
        className={cn(
          `p-1 rounded-full transition-colors flex items-center justify-center relative group cursor-pointer`,
          size === "small" ? "" : "p-2",
          white ? 'hover:bg-white/20' : 'hover:bg-gray-100',
          className
        )}
        title={tooltip ? undefined : "Copy to clipboard"}
      >
        {copiedField === type ? (
          <FaCheck className={`${iconSize} ${white ? 'text-white' : 'text-green-600'}`} />
        ) : (
          React.cloneElement(icon, { className: `${iconSize} ${white ? 'text-white/70' : 'text-gray-500'}` })
        )}
        
        {tooltip && (
          <div className={cn(
            "absolute px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10",
            tooltipPosition === "right" && "left-full ml-2 top-1/2 -translate-y-1/2",
            tooltipPosition === "bottom" && "top-full mt-2 left-1/2 -translate-x-1/2",
            tooltipPosition === "bottom-left" && "top-full mt-2 left-0",
            tooltipPosition === "left" && "right-full mr-2 top-1/2 -translate-y-1/2",
            tooltipPosition === "top" && "bottom-full mb-2 left-1/2 -translate-x-1/2",
            tooltipPosition === "top-right" && "bottom-full mb-2 right-0"
          )}>
            {tooltip}
          </div>
        )}
      </button>
    );
  };

  const InfoTooltip = ({ text, className = "" }) => (
    <div className={cn("relative inline-block ml-2 group", className)}>
      <FaInfoCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] leading-normal rounded 
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center break-words">
        {text}
      </div>
    </div>
  );

  const InfoRow = ({ 
    content, 
    type, 
    className = "", 
    isName = false, 
    white = false, 
    label = "",
    children = null,
    _isChild = false,
    icon = null
  }) => {
    return (
      <>
        <div 
          onClick={() => onCopy(content, type, id)}
          className={cn(
            'flex items-center py-1.5 px-2 cursor-pointer rounded -mx-2 group/row relative',
            !white && 'hover:bg-gray-50',
            isName ? 'justify-start' : 'justify-between',
            label ? 'tooltip tooltip-top tooltip-left-align' : '',
            className
          )}
          data-tip={label}
        >
          <div className="flex items-start">
            {!isName && icon && (
              <span className={cn(`text-gray-300 mr-2 w-4 flex-shrink-0`,
                type === "passphrase" ? "mt-1" : ""
              )}>
                {icon}
              </span>
            )}
            <span className={`${isName ? 'text-2xl font-semibold' : 'text-sm'} ${white ? 'text-white' : 'text-gray-700'} relative group/value`}>
                {content}
            </span>
          </div>
          <CopyButton className={isName ? "!ml-2" : "!ml-4"} text={content} type={type} white={white} />
        </div>
        {children}
      </>
    );
  };

  // Function to format all identity data for copying
  const formatIdentityForCopy = () => {
    return `Name: ${name.full}
Email: ${disposableEmail.email}
Disposable Email Inbox: ${disposableEmail.inboxUrl}
Username: ${username}
Passphrase: ${passphrase}
Phone: ${phone}
Address: ${address.full}
Birthday: ${birthday}`;
  };

  // Function to handle opening the modal
  const handleOpenModal = (e) => {
    e.stopPropagation();
    const saveModal = document.getElementById(`save-modal-${id}`);
    if (saveModal) {
      saveModal.showModal();
      setModalOpen(true);
    }
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Effect to handle modal cleanup
  useEffect(() => {
    // Ensure the modal is properly closed when component unmounts
    return () => {
      const saveModal = document.getElementById(`save-modal-${id}`);
      if (saveModal && saveModal.open) {
        saveModal.close();
      }
    };
  }, [id]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Banner and Avatar Section */}
      <div>
        <div className={`h-12 md:h-20 lg:h-24 ${gradient[1]} ${gradient[0]} relative`}>
          {/* Copy All Button and 1Password Save Button */}
          <div className="absolute top-2 left-2 md:left-4 md:top-4 flex items-center gap-2">
            
            
            <CopyButton 
              text={formatIdentityForCopy()} 
              type="fullIdentity" 
              white={true} 
              size="large"
              icon={<FaRegCopy />}
              className="bg-white/10 backdrop-blur-sm"
              tooltip="Copy identity to clipboard"
              tooltipPosition="bottom-left"
            />
            
            <button 
              onClick={handleOpenModal}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white relative group flex items-center justify-center"
              title="Save to 1Password"
            >
              <Si1Password className="w-5 h-5" />
              <div className="absolute px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 top-full mt-2 left-0">
                Save to 1Password
              </div>
            </button>
          </div>
          
          {/* Modal for 1Password Save Button - moved outside the top bar */}
          <dialog 
            id={`save-modal-${id}`} 
            className="modal"
            onClose={handleCloseModal}
            ref={modalRef}
          >
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-2">Save Identity to 1Password</h3>
              <p className="">Save this generated identity to your 1Password vault for future use.</p>
              {modalOpen && (
                <div className="flex justify-center items-center">
                  <OnePasswordSaveButton identity={identity} />
                </div>
              )}
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
        <div className="px-6 -mt-8 md:-mt-12 lg:-mt-14 flex justify-between items-start">
          <div className="flex-1 pr-4 mt-16 md:mt-16 lg:mt-20">
            <InfoRow content={name.full} type="name" className="!p-0 !-mx-0" isName={true} />
          </div>
          <div className="relative group">
            <div className={cn(
              "w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg flex-shrink-0",
              "relative overflow-hidden",
              !imageLoaded && "animate-pulse bg-gray-200"
            )}>
              {/* Skeleton loader */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                </div>
              )}
              
              {/* Actual image */}
              <img 
                ref={imgRef}
                src={avatar.url}
                alt={name.full}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 bg-white",
                  typeof avatar === 'string' && avatar.includes('dicebear') && "bg-white p-1",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              />
              
              {/* Error fallback */}
              {imageError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            
            {/* Download overlay with status */}
            <AvatarDownloadOverlay 
              downloadStatus={downloadStatus} 
              handleImageDownload={handleImageDownload} 
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-5 overflow-visible">
        {/* Info Section */}
        <div className="mt-2 overflow-visible">
          <InfoRow 
            content={disposableEmail.email}
            type="disposableEmail" 
            label="Disposable Email"
            icon={<FaEnvelope />}
          >
            <div className="flex items-center">
              <a 
                href={disposableEmail.inboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-10 py-1 px-2 -mx-2 flex items-start text-xs text-gray-500 hover:text-blue-600 transition-colors relative group"
              >
                <FaChevronRight className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 text-gray-400" />
                <span>View Mailbox on {disposableEmail.label}</span>
              </a>
              <InfoTooltip text={"This is a temporary inbox where you can receive emails. The inbox is public and emails are automatically deleted after 1-3 days depending on the provider."} />
            </div>
          </InfoRow>
          <InfoRow content={username} type="username" label="Username" className="text-gray-500" icon={<FaAt />} />
          <InfoRow content={passphrase} type="passphrase" label="Passphrase" icon={<FaShieldAlt />} className="monospace text-sm font-mono text-left" />
          <InfoRow content={phone} type="phone" label="Phone" icon={<FaPhone />} />
          <InfoRow content={address.full} type="address" label="Address" icon={<FaMapMarkerAlt />} />
          <InfoRow content={birthday} type="birthday" label="Birthday" icon={<FaBirthdayCake />} />
        </div>
      </div>
    </div>
  );
};

const IdentityDisplay = () => {
  const [identities, setIdentities] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const [genderPreference, setGenderPreference] = useState(() => {
    return ToolbarStorage.getGenderPreference(null);
  });
  const [enabledProviders, setEnabledProviders] = useState(() => {
    const defaultProviders = {
      realistic: true,
      avataaars: true,
      randomuser: true,
      notionists: true,
      identicon: true,
      personas: true,
      avataaarsNeutral: true,
      uiAvatars: true,
      shapes: true
    };
    return ToolbarStorage.getAvatarProviders(defaultProviders);
  });
  const [enabledEmailProviders, setEnabledEmailProviders] = useState(() => {
    const defaultEmailProviders = {
      reusable: true,
      maildrop: false,
      inboxkitten: false,
    };
    const stored = ToolbarStorage.getEmailProviders(defaultEmailProviders);
    return Object.fromEntries(
      Object.entries(stored).filter(([key]) => key in disposableEmailProviders)
    );
  });

  const avatarDropdownRef = useRef(null);
  const emailDropdownRef = useRef(null);

  // Sample identity for previews
  const sampleIdentity = {
    sex: 'male',
    full: 'John Smith'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        // setIsAvatarDropdownOpen(false);
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        // setIsEmailDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateNewIdentities = useCallback(async () => {
    const NUM_IDENTITIES = 4;
    const newIdentities = await generateIdentities(NUM_IDENTITIES, enabledProviders, genderPreference, enabledEmailProviders);
    setIdentities(newIdentities);
    setCopiedStates({});
  }, [enabledProviders, genderPreference, enabledEmailProviders]);

  const copyToClipboard = useCallback((text, type, cardId) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({
      ...prev,
      [cardId]: type
    }));
    setTimeout(() => {
      setCopiedStates(prev => ({
        ...prev,
        [cardId]: null
      }));
    }, 2000);
  }, []);

  useEffect(() => {
    generateNewIdentities();
  }, [generateNewIdentities]);

  const handleProviderToggle = (provider) => {
    setEnabledProviders(prev => {
      // Don't allow disabling all providers
      const wouldAllBeDisabled = Object.entries(prev)
        .filter(([key]) => key !== provider)
        .every(([_, enabled]) => !enabled) && prev[provider];
      
      if (wouldAllBeDisabled) return prev;
      
      const newProviders = {
        ...prev,
        [provider]: !prev[provider]
      };
      
      // Save to local storage
      ToolbarStorage.setAvatarProviders(newProviders);
      return newProviders;
    });
  };

  const handleSelectOnlyProvider = (provider) => {
    // Create a new object with all providers disabled except the selected one
    const newProviders = Object.keys(enabledProviders).reduce((acc, key) => {
      acc[key] = key === provider;
      return acc;
    }, {});
    
    // Save to local storage
    ToolbarStorage.setAvatarProviders(newProviders);
    setEnabledProviders(newProviders);
  };

  const handleEmailProviderToggle = (provider) => {
    setEnabledEmailProviders(prev => {
      // Don't allow disabling all email providers
      const wouldAllBeDisabled = Object.entries(prev)
        .filter(([key]) => key !== provider)
        .every(([_, enabled]) => !enabled) && prev[provider];
      
      if (wouldAllBeDisabled) return prev;
      
      const newProviders = {
        ...prev,
        [provider]: !prev[provider]
      };
      
      // Save to local storage
      ToolbarStorage.setEmailProviders(newProviders);
      return newProviders;
    });
  };

  return (
    <section className="content overflow-visible">
      <PageToolbar
        onGenerate={generateNewIdentities}
        generateButtonText="More"
        className="items-center"
        isSticky={true}
      >
        <select
          value={genderPreference || ''}
          onChange={(e) => {
            const value = e.target.value || null;
            setGenderPreference(value);
            ToolbarStorage.setGenderPreference(value);
          }}
          className="select select-bordered select-sm w-full md:w-[150px]"
        >
          <option value="" disabled>Pick Gender</option>
          <option value="">Random Gender</option>
          <option value="male">Man</option>
          <option value="female">Woman</option>
        </select>

        <div className="relative w-full md:w-auto" ref={avatarDropdownRef}>
          <div className="dropdown w-full">
            <div tabIndex={0} role="button" className="btn btn-sm w-full md:w-auto">
              Avatar Types
            </div>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-[280px]">
              <div className="px-3 py-2 border-b border-base-200 mb-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const allEnabled = Object.keys(enabledProviders).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {});
                    ToolbarStorage.setAvatarProviders(allEnabled);
                    setEnabledProviders(allEnabled);
                  }}
                  className="btn btn-xs btn-primary w-full text-white"
                >
                  Enable All
                </button>
              </div>
              {Object.entries(avatarProviders).map(([key, provider]) => (
                <label key={key} className="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledProviders[key]}
                    onChange={() => handleProviderToggle(key)}
                    className="checkbox checkbox-sm"
                  />
                  <img 
                    src={provider.generate(sampleIdentity)}
                    alt={provider.label}
                    className="w-8 h-8 rounded-full bg-white object-cover"
                  />
                  <span className="text-sm">{provider.label}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectOnlyProvider(key);
                    }}
                    className="ml-auto text-xs opacity-40 hover:opacity-100 btn btn-xs btn-ghost h-5 min-h-0 px-1.5 transition-opacity"
                    title="Enable only this avatar type"
                  >
                    <span className="text-xs">only</span>
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-auto" ref={emailDropdownRef}>
          <div className="dropdown w-full">
            <div tabIndex={0} role="button" className="btn btn-sm w-full md:w-auto">
              Email Providers
            </div>
            <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-[280px]">
              <div className="px-3 py-2 border-b border-base-200 mb-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const allEnabled = Object.keys(enabledEmailProviders).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {});
                    ToolbarStorage.setEmailProviders(allEnabled);
                    setEnabledEmailProviders(allEnabled);
                  }}
                  className="btn btn-xs btn-primary w-full text-white"
                >
                  Enable All
                </button>
              </div>
              {Object.entries(disposableEmailProviders).map(([key, provider]) => (
                <label key={key} className="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledEmailProviders[key]}
                    onChange={() => handleEmailProviderToggle(key)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">{provider.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </PageToolbar>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 overflow-visible">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            onCopy={copyToClipboard}
            copiedField={copiedStates[identity.id]}
          />
        ))}
      </div>
    </section>
  );
};

const IdentityPage = () => {
  return (
    <div className="container mx-auto p-4 overflow-visible">
      <h2 className="page-title">Identity Generator</h2>
      
      <div className="bg-indigo-100/70 py-4 px-8 rounded-lg mb-6">
        <div className="text-center">
          <h3 className="mb-2">How to use a fake identity to protect your privacy</h3>
          <p className="text-gray-700">
            Protect your privacy online by using generated identities instead of your real information.
            This helps prevent <a href="https://en.wikipedia.org/wiki/Doxxing" className="text-blue-500 hover:underline">doxxing</a> and keeps your personal data secure.
          </p>
        </div>
      </div>
      
      <IdentityDisplay />
      
      
      <div className="mt-16">
        <IdentityFAQ />
      </div>
    </div>
  );
};

export default IdentityPage; 