import HypnoticLoader from "@/components/HypnoticLoader";

export const LoadingModal = () => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
				<HypnoticLoader />
			</div>
		</div>
	);
}; 