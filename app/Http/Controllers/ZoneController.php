<?php

namespace App\Http\Controllers;

use App\Http\Requests\ZoneRequest;
use App\Models\ELT;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ZoneController extends Controller
{
    public function zones(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at'); // default sort column
        $sortDir = $request->input('sort_dir', 'desc');     // default sort direction

        $allowedSortFields = ['id', 'label', 'elt_id', 'created_at'];

        $query = Zone::query();

        // Optional search across multiple fields
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('label', 'like', "%{$search}%");
            });
        }

        // Validate and apply sorting
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest(); // fallback if invalid column
        }

        $zones = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection for frontend
        $zones->getCollection()->transform(function ($zone) {
            return [
                'id' => $zone->id,
                'label' => $zone->label,
                'elt_id' => $zone->elt_id,
                'elt_name' => $zone->elt->label,
                'created_at' => $zone->created_at->format('d M Y'),
            ];
        });

        // Fetch Elts
        $elts = ELT::get();

        return response()->json([
            'zones' => $zones,
            'elts' => $elts,
        ]);
    }

    public function zonesByCluster($clusterId)
    {
        $zones = Zone::select('label', 'name')->where('elt_id', $clusterId)->get();

        $zones = $zones->map(function ($zone) {
            return [
                'value' => $zone->name,
                'label' => $zone->label,
            ];
        });

        return response()->json([
            'zones' => $zones,
        ]);
    }

    public function create(ZoneRequest $request)
    {
        $zone = Zone::create([
            'label' => $request->input('label'),
            'name' => Str::slug($request->input('label')),
            'elt_id' => $request->input('elt'),
        ]);

        if ($zone) {
            return response()->json([
                'message' => 'Zone created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create zone. Please try again!',
        ], 500);
    }

    public function edit(ZoneRequest $request, Zone $zone)
    {
        if ($zone) {
            $zone->label = $request->input('label');
            $zone->elt_id = $request->input('elt');
            $zone->save();

            return response()->json([
                'message' => 'Zone created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create zone Please try again!',
        ], 500);
    }

    public function destroy(Zone $zone)
    {
        if (!$zone) {
            return response()->json([
                'error' => 'Zone not found.'
            ], 404);
        }

        try {
            Zone::withoutEvents(function () use ($zone) {
                $zone->delete();
            });
            return response()->json([
                'message' => 'Zone deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete zone. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }
}
