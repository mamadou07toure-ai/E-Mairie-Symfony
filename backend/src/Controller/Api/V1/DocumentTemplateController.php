<?php

namespace App\Controller\Api\V1;

use App\Entity\DocumentTemplate;
use App\Entity\TypeDemande;
use App\Repository\DocumentTemplateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/document-templates', name: 'api_admin_document_templates_')]
#[IsGranted('ROLE_ADMINISTRATEUR')]
class DocumentTemplateController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private DocumentTemplateRepository $templateRepository,
        private string $projectDir
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $types = $this->em->getRepository(TypeDemande::class)->findBy(['isActive' => true], ['libelle' => 'ASC']);

        $data = array_map(function (TypeDemande $type) {
            $tpl = $type->getDocumentTemplate();
            return [
                'type_demande' => $type->toArray(),
                'template'     => $tpl ? $tpl->toArray() : null,
            ];
        }, $types);

        return $this->json(['data' => $data]);
    }

    #[Route('', name: 'store', methods: ['POST'])]
    public function store(Request $request): JsonResponse
    {
        $typeDemandeId = (int) $request->request->get('type_demande_id');
        $nom           = trim($request->request->get('nom', ''));
        $imageFile     = $request->files->get('image');

        if (!$typeDemandeId || !$nom) {
            return $this->json(['message' => 'type_demande_id et nom sont requis.'], 400);
        }

        $typeDemande = $this->em->getRepository(TypeDemande::class)->find($typeDemandeId);
        if (!$typeDemande) {
            return $this->json(['message' => 'Type de demande introuvable.'], 404);
        }

        if (!$imageFile) {
            return $this->json(['message' => "L'image est requise."], 400);
        }

        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!in_array($imageFile->getMimeType(), $allowedMimes, true)) {
            return $this->json(['message' => 'Format non autorisé. Utilisez JPG ou PNG.'], 422);
        }

        if ($imageFile->getSize() > 10 * 1024 * 1024) {
            return $this->json(['message' => "L'image ne doit pas dépasser 10 Mo."], 422);
        }

        $uploadDir = $this->projectDir . '/public/uploads/templates';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $existing = $this->templateRepository->findOneBy(['typeDemande' => $typeDemande]);
        if ($existing && $existing->getCheminImage()) {
            $oldFile = $uploadDir . '/' . basename($existing->getCheminImage());
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }

        $ext      = $imageFile->guessExtension() ?? 'jpg';
        $filename = 'tpl-' . $typeDemandeId . '-' . uniqid() . '.' . $ext;
        $imageFile->move($uploadDir, $filename);

        if ($existing) {
            $existing->setNom($nom);
            $existing->setCheminImage($filename);
            $existing->setActif(false);
            $existing->setChamps(null);
            $template = $existing;
        } else {
            $template = new DocumentTemplate();
            $template->setTypeDemande($typeDemande);
            $template->setNom($nom);
            $template->setCheminImage($filename);
            $template->setActif(false);
            $this->em->persist($template);
        }

        $this->em->flush();

        return $this->json(['message' => 'Modèle enregistré.', 'template' => $template->toArray()], 201);
    }

    #[Route('/{id}/champs', name: 'update_champs', methods: ['PUT'])]
    public function updateChamps(int $id, Request $request): JsonResponse
    {
        $template = $this->templateRepository->find($id);
        if (!$template) {
            return $this->json(['message' => 'Modèle introuvable.'], 404);
        }

        $data   = json_decode($request->getContent(), true);
        $champs = $data['champs'] ?? null;

        if (!is_array($champs)) {
            return $this->json(['message' => 'champs doit être un tableau JSON.'], 422);
        }

        foreach ($champs as $champ) {
            if (empty($champ['key']) || !isset($champ['x'], $champ['y'])) {
                return $this->json(['message' => 'Chaque champ doit avoir key, x et y.'], 422);
            }
        }

        $template->setChamps($champs);
        $this->em->flush();

        return $this->json(['message' => 'Champs sauvegardés.', 'template' => $template->toArray()]);
    }

    #[Route('/{id}/toggle', name: 'toggle', methods: ['PATCH'])]
    public function toggle(int $id): JsonResponse
    {
        $template = $this->templateRepository->find($id);
        if (!$template) {
            return $this->json(['message' => 'Modèle introuvable.'], 404);
        }

        $template->setActif(!$template->isActif());
        $this->em->flush();

        return $this->json([
            'message' => $template->isActif() ? 'Modèle activé.' : 'Modèle désactivé.',
            'actif'   => $template->isActif(),
        ]);
    }

    #[Route('/{id}', name: 'destroy', methods: ['DELETE'])]
    public function destroy(int $id): JsonResponse
    {
        $template = $this->templateRepository->find($id);
        if (!$template) {
            return $this->json(['message' => 'Modèle introuvable.'], 404);
        }

        if ($template->getCheminImage()) {
            $filePath = $this->projectDir . '/public/uploads/templates/' . basename($template->getCheminImage());
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }

        $this->em->remove($template);
        $this->em->flush();

        return $this->json(['message' => 'Modèle supprimé.']);
    }
}
