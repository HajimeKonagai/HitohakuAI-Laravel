const is_json = (data) =>
{
	try {
		JSON.parse(data);
	} catch (error) {
		return false;
	}
	return JSON.parse(data); // null 対策
}

export {
    is_json
}