<?php

namespace App\Service;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use Symfony\Component\HttpFoundation\Response;
use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;

class ExportService
{
    public function __construct(
        private Environment $twig
    ) {
    }

    public function exportDossiersExcel(array $demandes): Response
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Headers
        $headers = ['N° Dossier', 'Citoyen', 'Type', 'Statut', 'Agent', 'Date Création', 'Date Échéance'];
        foreach ($headers as $index => $header) {
            $col = chr(65 + $index);
            $sheet->setCellValue($col . '1', $header);
        }

        // Style header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4F46E5']],
        ];
        $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);

        // Data
        $row = 2;
        foreach ($demandes as $d) {
            $sheet->setCellValue('A' . $row, $d['numero_dossier']);
            $sheet->setCellValue('B' . $row, $d['user']['nom'] . ' ' . $d['user']['prenom']);
            $sheet->setCellValue('C' . $row, $d['type_demande']['libelle']);
            $sheet->setCellValue('D' . $row, $d['statut_label']);
            $sheet->setCellValue('E' . $row, $d['agent'] ? $d['agent']['nom'] . ' ' . $d['agent']['prenom'] : 'Non assigné');
            $sheet->setCellValue('F' . $row, $d['created_at']);
            $sheet->setCellValue('G' . $row, $d['date_echeance']);
            $row++;
        }

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $temp_file = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($temp_file);

        return new Response(file_get_contents($temp_file), 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="dossiers.xlsx"',
        ]);
    }

    public function exportDossiersPdf(array $demandes, $user): Response
    {
        $html = $this->twig->render('pdf/dossiers.html.twig', [
            'demandes' => $demandes,
            'user' => $user,
            'date' => new \DateTime(),
        ]);

        return $this->generatePdfResponse($html, 'dossiers.pdf');
    }

    public function exportStatsExcel(array $stats): Response
    {
        $spreadsheet = new Spreadsheet();
        
        // Sheet 1: Mensuel
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Volume Mensuel');
        $sheet1->setCellValue('A1', 'Mois')->setCellValue('B1', 'Volume');
        $sheet1->getStyle('A1:B1')->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4F46E5']]]);
        
        $row = 2;
        foreach ($stats['monthly_stats'] ?? [] as $stat) {
            $sheet1->setCellValue('A' . $row, $stat['name'])->setCellValue('B' . $row, $stat['count']);
            $row++;
        }

        // Sheet 2: Par Type
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Par Type');
        $sheet2->setCellValue('A1', 'Type')->setCellValue('B1', 'Volume');
        $sheet2->getStyle('A1:B1')->applyFromArray(['font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4F46E5']]]);
        
        $row = 2;
        foreach ($stats['type_stats'] ?? [] as $stat) {
            $sheet2->setCellValue('A' . $row, $stat['name'])->setCellValue('B' . $row, $stat['value']);
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $temp_file = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($temp_file);

        return new Response(file_get_contents($temp_file), 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="statistiques.xlsx"',
        ]);
    }

    public function exportStatsPdf(array $stats, $user): Response
    {
        $html = $this->twig->render('pdf/stats.html.twig', [
            'stats' => $stats,
            'user' => $user,
            'date' => new \DateTime(),
        ]);

        return $this->generatePdfResponse($html, 'statistiques.pdf');
    }

    private function generatePdfResponse(string $html, string $filename): Response
    {
        $options = new Options();
        $options->set('defaultFont', 'Arial');
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return new Response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
