<?php

namespace App\Controller\Api\V1;

use App\Entity\Demande;
use App\Entity\User;
use App\Entity\Document;
use App\Enum\RoleEnum;
use App\Enum\TypeDocumentEnum;
use Dompdf\Dompdf;
use Dompdf\Options;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/agent', name: 'api_agent_')]
#[IsGranted('ROLE_AGENT')]
class AgentController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private \Twig\Environment $twig
    ) {
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        /** @var User $agent */
        $agent = $this->getUser();
        $repo = $this->em->getRepository(Demande::class);

        return $this->json([
            'assignes' => $repo->count(['agent' => $agent]),
            'en_cours' => $repo->count(['agent' => $agent, 'statut' => ['en_cours', 'document_manquant']]),
            'traites' => $repo->count(['agent' => $agent, 'statut' => ['validee', 'rejetee']]),
            'en_attente_global' => $repo->count(['statut' => 'en_attente'])
        ]);
    }

    #[Route('/demandes', name: 'demandes', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $qb = $this->em->getRepository(Demande::class)->createQueryBuilder('d')
            ->orderBy('d.createdAt', 'DESC');

        if ($request->query->get('filter') === 'mine') {
            $qb->andWhere('d.agent = :agent')
               ->setParameter('agent', $this->getUser());
        }

        $demandes = $qb->getQuery()->getResult();
        return $this->json(['data' => array_map(fn($d) => $d->toListArray(), $demandes)]);
    }

    #[Route('/demandes/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);
        return $this->json($demande->toArray());
    }

    #[Route('/demandes/{uuid}/assign', name: 'assign', methods: ['POST'])]
    public function assign(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        if ($demande->getAgent() !== null) {
            return $this->json(['message' => 'Ce dossier est déjà pris en charge par un autre agent.'], 400);
        }

        $demande->setAgent($this->getUser());
        $demande->setStatut(\App\Enum\StatutDemandeEnum::EN_COURS);
        $this->em->flush();

        return $this->json(['message' => 'Dossier pris en charge avec succès.']);
    }

    #[Route('/demandes/{uuid}/unassign', name: 'unassign', methods: ['POST'])]
    public function unassign(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        /** @var User $agent */
        $agent = $this->getUser();
        if ($demande->getAgent() !== $agent) {
            return $this->json(['message' => 'Ce dossier ne vous est pas assigné.'], 403);
        }

        $demande->setAgent(null);
        $demande->setStatut(\App\Enum\StatutDemandeEnum::EN_ATTENTE);
        $this->em->flush();

        return $this->json(['message' => 'Dossier relâché avec succès.']);
    }

    #[Route('/demandes/{uuid}/status', name: 'status', methods: ['POST'])]
    public function updateStatus(string $uuid, Request $request): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        $data = json_decode($request->getContent(), true);
        $newStatus = $data['statut'] ?? null;
        $comment = $data['commentaire'] ?? '';

        if (!$newStatus) {
            return $this->json(['message' => 'Statut requis'], 400);
        }

        try {
            $statutEnum = \App\Enum\StatutDemandeEnum::from($newStatus);
        } catch (\ValueError $e) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }

        $demande->setStatut($statutEnum);

        if ($newStatus === 'validee') {
            $demande->setDateCloture(new \DateTime());
            
            // 1. Generate the main Civil Status document
            $typeCode = $demande->getTypeDemande()->getCode();
            $template = null;
            if ($typeCode === 'ACTE_NAISSANCE') {
                $template = 'pdf/acte_naissance.html.twig';
            } elseif ($typeCode === 'CERTIFICAT_RESIDENCE') {
                $template = 'pdf/certificat_residence.html.twig';
            } elseif ($typeCode === 'CERTIFICAT_MARIAGE') {
                $template = 'pdf/certificat_mariage.html.twig';
            } elseif ($typeCode === 'LEGALISATION_DOCUMENT') {
                $template = 'pdf/legalisation_document.html.twig';
            }

            if ($template) {
                try {
                    // Use specific_data and donnees_formulaire as the template data source
                    $formulaire = $demande->getDonneesFormulaire() ?? [];
                    $specific = $demande->getSpecificData() ?? [];
                    $specificData = array_merge($specific, $formulaire);
                    
                    $html = $this->twig->render($template, [
                        'demande' => $demande,
                        'specific_data' => $specificData,
                    ]);

                    $options = new Options();
                    $options->set('defaultFont', 'Helvetica');
                    $options->set('isRemoteEnabled', true);

                    $dompdf = new Dompdf($options);
                    $dompdf->loadHtml($html);
                    $dompdf->setPaper('A4', 'portrait');
                    $dompdf->render();

                    $pdfContent = $dompdf->output();
                    
                    $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/demandes';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    
                    $filename = 'ACTE-' . $demande->getNumeroDossier() . '-' . uniqid() . '.pdf';
                    $filepath = $uploadDir . '/' . $filename;
                    file_put_contents($filepath, $pdfContent);

                    // Attach as DOCUMENT_GENERE
                    $document = new Document();
                    $document->setNomOriginal('Acte Officiel - ' . $demande->getTypeDemande()->getLibelle() . '.pdf');
                    $document->setCheminStockage($filepath);
                    $document->setTypeMime('application/pdf');
                    $document->setTailleOctets(filesize($filepath) ?: 0);
                    $document->setUploadedBy($this->getUser());
                    $document->setDemande($demande);
                    $document->setTypeDocument(TypeDocumentEnum::DOCUMENT_GENERE);
                    
                    $this->em->persist($document);
                } catch (\Exception $e) {
                    error_log('[PDF GENERATION ERROR] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                    file_put_contents(__DIR__.'/../../../../pdf_error.log', $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() . "\n" . $e->getTraceAsString());
                    return $this->json(['message' => 'Erreur lors de la génération du document officiel. Validation annulée.'], 500);
                }
            }

            // 2. Generate the Bon de Retrait (if physical pickup)
            if ($demande->isPhysicalPickup()) {
                try {
                    $formulaire = $demande->getDonneesFormulaire() ?? [];
                    $specific = $demande->getSpecificData() ?? [];
                    $specificData = array_merge($specific, $formulaire);
                    
                    $html = $this->twig->render('pdf/bon_retrait.html.twig', [
                        'demande' => $demande,
                        'specific_data' => $specificData,
                    ]);

                    $options = new Options();
                    $options->set('defaultFont', 'Helvetica');
                    $options->set('isRemoteEnabled', true);

                    $dompdf = new Dompdf($options);
                    $dompdf->loadHtml($html);
                    $dompdf->setPaper('A4', 'portrait');
                    $dompdf->render();

                    $pdfContent = $dompdf->output();
                    
                    $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/demandes';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }
                    
                    $filename = 'BON-' . $demande->getNumeroDossier() . '-' . uniqid() . '.pdf';
                    $filepath = $uploadDir . '/' . $filename;
                    file_put_contents($filepath, $pdfContent);

                    // Attach as DOCUMENT_GENERE
                    $document = new Document();
                    $document->setNomOriginal('Bon de Retrait Mairie.pdf');
                    $document->setCheminStockage($filepath);
                    $document->setTypeMime('application/pdf');
                    $document->setTailleOctets(filesize($filepath) ?: 0);
                    $document->setUploadedBy($this->getUser());
                    $document->setDemande($demande);
                    $document->setTypeDocument(TypeDocumentEnum::DOCUMENT_GENERE);
                    
                    $this->em->persist($document);
                } catch (\Exception $e) {
                    error_log('[BON RETRAIT ERROR] ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                    return $this->json(['message' => 'Erreur lors de la génération du bon de retrait. Validation annulée.'], 500);
                }
            }
        }

        if ($newStatus === 'rejetee') {
            $demande->setMotifRejet($comment);
        }
        if ($newStatus === 'document_manquant') {
            $demande->setPieceManquante($comment);
        }
        if (in_array($newStatus, ['validee', 'rejetee'])) {
            $demande->setDateCloture(new \DateTime());
        }

        $this->em->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès.']);
    }

    #[Route('/demandes/{uuid}/close', name: 'close', methods: ['POST'])]
    public function close(string $uuid): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        // Only applicable for physical pickup demands that are already validated
        if (!$demande->isPhysicalPickup()) {
            return $this->json(['message' => 'Cette action ne s\'applique qu\'aux demandes de retrait physique.'], 400);
        }

        if ($demande->getStatut() !== \App\Enum\StatutDemandeEnum::VALIDEE) {
            return $this->json(['message' => 'Le dossier doit être validé avant de pouvoir être clôturé.'], 400);
        }

        // Mark as 'remise' — document handed over at the counter
        $demande->setStatut(\App\Enum\StatutDemandeEnum::REMISE);
        $demande->setDateCloture(new \DateTime());
        $this->em->flush();

        return $this->json(['message' => 'Dossier clôturé. Document remis au citoyen.']);
    }

    #[Route('/demandes/{uuid}/messages', name: 'demandes_messages_post', methods: ['POST'])]
    public function postMessage(string $uuid, Request $request): JsonResponse
    {
        $demande = $this->em->getRepository(Demande::class)->findOneBy(['uuid' => $uuid]);
        if (!$demande) return $this->json(['message' => 'Demande introuvable'], 404);

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return $this->json(['message' => 'Le message ne peut pas être vide'], 400);
        }

        $message = new \App\Entity\Message();
        $message->setContent($data['content']);
        $message->setSender($this->getUser());
        $message->setDemande($demande);

        $this->em->persist($message);
        $this->em->flush();

        return $this->json(['message' => 'Message envoyé.', 'data' => $message->toArray()], 201);
    }

    #[Route('/messages/{id}', name: 'messages_edit', methods: ['PATCH'])]
    public function editMessage(int $id, Request $request): JsonResponse
    {
        $message = $this->em->getRepository(\App\Entity\Message::class)->find($id);
        if (!$message) return $this->json(['message' => 'Message introuvable'], 404);

        $user = $this->getUser();
        if ($message->getSender()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Vous ne pouvez modifier que vos propres messages'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return $this->json(['message' => 'Le contenu ne peut pas être vide'], 400);
        }

        $message->setContent($data['content']);
        $message->setIsEdited(true);
        $message->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json(['message' => 'Message modifié.', 'data' => $message->toArray()]);
    }

    #[Route('/messages/{id}', name: 'messages_delete', methods: ['DELETE'])]
    public function deleteMessage(int $id): JsonResponse
    {
        $message = $this->em->getRepository(\App\Entity\Message::class)->find($id);
        if (!$message) return $this->json(['message' => 'Message introuvable'], 404);

        $user = $this->getUser();
        if ($message->getSender()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Vous ne pouvez supprimer que vos propres messages'], 403);
        }

        $this->em->remove($message);
        $this->em->flush();

        return $this->json(['message' => 'Message supprimé.']);
    }
}
