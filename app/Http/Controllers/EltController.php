<?php

namespace App\Http\Controllers;

use App\Http\Requests\EltRequest;
use Illuminate\Http\Request;
use App\Models\ELT;
use Illuminate\Support\Str;

class EltController extends Controller
{
    public function elts(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at'); // default sort column
        $sortDir = $request->input('sort_dir', 'desc');     // default sort direction

        $allowedSortFields = ['id', 'label', 'created_at'];

        $query = Elt::query();

        // Optional search across multiple fields
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Validate and apply sorting
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest(); // fallback if invalid column
        }

        $elts = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection for frontend
        $elts->getCollection()->transform(function ($elt) {
            return [
                'id' => $elt->id,
                'label' => $elt->label,
                'created_at' => $elt->created_at->format('d M Y'),
            ];
        });

        return response()->json($elts);
    }

    public function create(EltRequest $request)
    {
        $elt = $request->validated();

        $savedElt = Elt::create([
            'label' => $elt['label'],
            'name' => Str::slug($elt['label'])
        ]);

        if (!$savedElt) {
            return response()->json([
                'error' => 'Unable to create Elt. Please try again !'
            ], 500);
        }

        return response()->json([
            'message' => 'Elt created Successfully !'
        ], 200);
    }

    public function edit(EltRequest $request, Elt $elt)
    {
        if ($elt) {
            $elt->label = $request->input('label');
            $elt->save();

            return response()->json([
                'message' => 'Elt updated successfully!',
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update Elt. Please try again!',
        ], 500);
    }

    public function destroy(Elt $elt)
    {
        if (!$elt) {
            return response()->json([
                'error' => 'Elt not found.'
            ], 404);
        }

        try {
            Elt::withoutEvents(function () use ($elt) {
                $elt->delete();
            });
            return response()->json([
                'message' => 'Elt deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete Elt. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }
}
