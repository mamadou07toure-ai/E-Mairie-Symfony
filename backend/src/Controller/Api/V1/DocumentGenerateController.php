<?php

namespace App\Controller\Api\V1;

use App\Entity\Demande;
use App\Entity\User;
use App\Enum\StatutDemandeEnum;
use App\Service\DocumentGeneratorService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/demandes/{uuid}/generer-document', name: 'api_demandes_generer_document', methods: ['GET'])]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class DocumentGenerateController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private DocumentGeneratorService $generatorService
    ) {}

    public function __invoke(string $uuid): Response
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) {
            return new JsonResponse(['message' => 'Dossier introuvable.'], 404);
        }

        /** @var User $currentUser */
        $currentUser = $this->getUser();
        $isOwner     = $demande->getUser()?->getId() === $currentUser->getId();
        $isPriv      = \in_array('ROLE_AGENT', $currentUser->getRoles(), true)
                    || \in_array('ROLE_ADMINISTRATEUR', $currentUser->getRoles(), true);

        if (!$isOwner && !$isPriv) {
            return new JsonResponse(['message' => 'Accès refusé.'], 403);
        }

        if ($demande->getStatut() !== StatutDemandeEnum::VALIDEE) {
            return new JsonResponse(['message' => 'Le dossier doit être validé pour générer un document.'], 422);
        }

        try {
            $pdfContent = $this->generatorService->generer($demande);
        } catch (\RuntimeException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 422);
        }

        $filename = 'Document-' . $demande->getNumeroDossier() . '.pdf';

        $response = new Response($pdfContent);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        $response->headers->set('Content-Length', (string)\strlen($pdfContent));
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Disposition');

        return $response;
    }
}
