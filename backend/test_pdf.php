<?php
use Symfony\Component\Dotenv\Dotenv;
require 'vendor/autoload.php';

(new Dotenv())->bootEnv(__DIR__.'/.env');
$kernel = new \App\Kernel('dev', true);
$kernel->boot();

$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();

$loader = new \Twig\Loader\FilesystemLoader(__DIR__.'/templates');
$standaloneTwig = new \Twig\Environment($loader, ['debug' => true]);
$standaloneTwig->addExtension(new \Twig\Extension\DebugExtension());
$standaloneTwig->addFilter(new \Twig\TwigFilter('date', function ($date, $format = 'd/m/Y') {
    if (!$date) return '';
    return date($format, strtotime($date));
}));

$demande = $em->getRepository(\App\Entity\Demande::class)->find(13);

try {
    $html = $standaloneTwig->render('pdf/certificat_mariage.html.twig', [
        'demande' => $demande,
        'specific_data' => $demande->getDonneesFormulaire()
    ]);
    
    $options = new \Dompdf\Options();
    $options->set('defaultFont', 'Helvetica');
    $options->set('isRemoteEnabled', true);

    $dompdf = new \Dompdf\Dompdf($options);
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();

    echo "SUCCESS_DOMPDF\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
