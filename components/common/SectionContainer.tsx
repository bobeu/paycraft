import React from 'react';

export const SectionContainer : React.FC<{sectionId: string, title: string, children: React.ReactNode}> = ({sectionId, title, children}) => {
    return (
        <section id={sectionId} >
            <div className='bg-[#22668d] bg-opacity-90 rounded py-4 space-y-4'>
                <h3 className="ml-4 text-[#FFCC70] uppercase font-semibold">{ title }</h3>
                { children }
            </div>
        </section>
    );
}

export const SectionButton : React.FC<{disableButton: boolean, handleClick: () => Promise<void | (null | undefined)>, buttonText: string}> = ({disableButton, handleClick, buttonText}) => {
    return(
        <button
            disabled={disableButton}
            onClick={handleClick}
            className='w-full rounded-full bg-[#4dcff3] p-2 text-white font-semibol uppercase cursor-pointer hover:bg-opacity-90'
        >
            { buttonText }
        </button>
    );
}