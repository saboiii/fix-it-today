import React from "react";

interface ConfirmationSectionProps {
    mainLoading: boolean;
    product?: any; // Replace 'any' with your actual product type if available
    handleDelete: () => void;
    deleting: boolean;
}

export default function ConfirmationSection({
    mainLoading,
    product,
    handleDelete,
    deleting,
}: ConfirmationSectionProps) {
    return (
        <div className='flex flex-col w-full mt-4 gap-2 col-span-3'>
            {/* Submit */}
            <button
                type="submit"
                className={`button-danger w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none`}
                disabled={mainLoading}
            >
                {mainLoading && (
                    <span className="inline-block h-3 w-3 border border-text border-t-transparent rounded-full animate-spin"></span>
                )}
                {mainLoading
                    ? product ? "Editing..." : "Creating..."
                    : product ? "Edit Product" : "Create Product"}
            </button>

            {/* Delete */}
            {
                product && <button
                    type="button"
                    className={`button-primary w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none`}
                    disabled={deleting || mainLoading}
                    onClick={handleDelete}
                >
                    {deleting && (
                        <span className="inline-block h-3 w-3 border border-black border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {deleting ? "Deleting..." : "Delete Product"}
                </button>
            }

        </div>
    );
}