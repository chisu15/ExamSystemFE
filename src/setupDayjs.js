import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import minMax from "dayjs/plugin/minMax";
import utc from "dayjs/plugin/utc";

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(minMax);
dayjs.extend(utc);

export default dayjs;
