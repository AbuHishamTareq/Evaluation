<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\Header;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DynamicTableController extends Controller
{
    public function store(Request $request)
    {
        \Log::info($request->all());

        $request->validate([
            'section' => 'required|exists:sections,name',
            'rows' => 'required|array|min:1',
            'rows.*.headerNameEn' => 'required|string|max:255',
            'rows.*.headerNameAr' => 'required|string|max:255',
            'rows.*.fieldType' => 'required|string|max:50',
            'rows.*.options' => 'nullable|array',
            'rows.*.order' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            foreach ($request->rows as $row) {
                $header = Header::create([
                    'header_en' => $row['headerNameEn'],
                    'header_ar' => $row['headerNameAr'],
                    'section_id' => $request->input('section'),
                    'order' => $row['order'],
                ]);

                Field::create([
                    'header_id' => $header->slug,
                    'control_type' => $row['fieldType'],
                    'options'      => $row['options'] ? ['options' => $row['options']] : null,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Headers and Fields saved successfully!'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error saving data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
