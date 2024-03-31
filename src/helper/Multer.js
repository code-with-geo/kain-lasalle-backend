import multer from "multer";

const filefilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const upload = multer({
	storage: multer.memoryStorage(),
	fileFilter: filefilter,
});

export { upload as MulterSetup };
