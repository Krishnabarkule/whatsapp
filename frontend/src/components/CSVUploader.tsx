import React, { useRef } from "react";

type Props = { onFile: (file: File) => void };

const CSVUploader: React.FC<Props> = ({ onFile }) => {
	const ref = useRef<HTMLInputElement | null>(null);
	return (
		<div>
			<input
				ref={ref}
				type="file"
				accept=".csv"
				style={{ display: "none" }}
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onFile(f);
				}}
			/>
			<button className="btn" onClick={() => ref.current?.click()}>
				Upload CSV
			</button>
		</div>
	);
};

export default CSVUploader;
