/**
 * Utility class implementing defined interface https://docs.tibco.com/pub/amx-bpm/4.3.3/doc/html/Default.htm#Business-Data-Services-Developer-Guide/scriptutil.htm?TocPath=Business%2520Data%2520Services%2520Developer%2520Guide%257CBusiness%2520Data%2520Scripting%257CStatic%2520Factory%2520Methods%257C_____3
 */
export class ScriptUtil {
  public static toXML(object: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<object>${
      JSON.stringify(object)
    }</object>`;
  }
}
