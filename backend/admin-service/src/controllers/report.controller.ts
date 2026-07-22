import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { ReportService } from '../services/report.service';
import { ReportsQuerySchema } from '../validators/admin.validation';
import { UnauthorizedException } from 'shared-common';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  generateReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('Unauthorized');
      }

      const queryResult = ReportsQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        throw queryResult.error;
      }

      const { type, from, to, format } = queryResult.data;

      const buffer = await this.reportService.generateReport(type, format, from, to);

      let contentType = 'text/csv';
      if (format === 'pdf') {
        contentType = 'application/pdf';
      } else if (format === 'excel') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report-${type}-${Date.now()}.${format}"`
      );

      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
