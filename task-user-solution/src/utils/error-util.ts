export class ErrorUtil {
  public static getErrorCode(error: Error): string {
    return "500";
  }

  public static getErrorDetail(error: Error): string {
    return error.message ?? "Unknown error";
  }
}
