import { useState } from 'react';
import { PiDotsThree, PiDotsThreeLight, PiDotsThreeOutlineFill } from 'react-icons/pi';
interface SidebarProps {
    setOption: (option: PWSidebarOptions) => void;
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
}

function Sidebar({ setOption, sidebarOpen, onSidebarToggle }: SidebarProps) {
    const [selected, setSelected] = useState<string | null>("Product Details");

    const handleSelect = (option: PWSidebarOptions) => {
        setSelected(option);
        setOption(option);
    };

    const options: PWSidebarOptions[] = ["Product Details", "Promotion", "Sales Information", "Confirmation"];

    return (
        <div className={`relative absolute bg-background flex flex-col z-10 sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-[82%]'}`}>
            <div className='flex flex-row items-center justify-end w-full'>
                <PiDotsThree size={20} onClick={onSidebarToggle} className='flex hover:cursor-pointer mb-5 mt-4' />
            </div>
            {options.map(option => (
                <button
                    key={option}
                    className={`flex uppercase px-2 py-1 sidebarButton ${selected === option ? 'bg-text/10' : 'bg-transparent'}`}
                    onClick={() => handleSelect(option)}
                    disabled={!sidebarOpen}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}

export default Sidebar;